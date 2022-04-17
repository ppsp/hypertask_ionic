import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Platform, ModalController, LoadingController, AlertController } from '@ionic/angular';
import { TaskGroup } from 'src/app/models/Core/task-group';
import { CalendarTaskService } from 'src/app/services/calendar-task.service';
import { TranslateService } from '@ngx-translate/core';
import { ILogger } from 'src/app/interfaces/i-logger';
import { InvalidTaskGroupError } from 'src/app/models/Exceptions/InvalidTaskGroupError';
import { AlertService } from 'src/app/services/alert.service';
import { AlertOptions } from '@ionic/core';
import NumberUtils from 'src/app/shared/number-utils';
import { UserService } from 'src/app/services/user.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-group-create',
  templateUrl: './group-create.component.html',
  styleUrls: ['./group-create.component.scss'],
})
export class GroupCreateComponent implements OnInit, OnDestroy {

  private backButtonSubscription: Subscription;

  public currentGroup: TaskGroup;
  public selectableTasks: TaskSelectionViewModel[] = [];
  public selectedAfterGroup: GroupPositionViewModel;
  public allOtherGroups: GroupPositionViewModel[] = [];
  public selectAllChecked: boolean;
  public taskTypeValue: string = 'Once';

  constructor(private platform: Platform,
              private modalController: ModalController,
              private calendarTaskService: CalendarTaskService,
              private loadingController: LoadingController,
              private translate: TranslateService,
              private logger: ILogger,
              private alertCtrl: AlertController,
              private alertService: AlertService,
              private userService: UserService) { }

  async ngOnInit() {
    this.resetBackButton();

    const otherGroups = this.calendarTaskService.allGroups
                                                .filter(p => p.Void !== true)
                                                .sort((x, y) => x.Position > y.Position ? 1 : -1);

    this.currentGroup = new TaskGroup();
    this.currentGroup.GroupId = NumberUtils.getRandomId();
    this.currentGroup.InsertDate = new Date();
    this.currentGroup.UserId = await this.userService.getCurrentUserId();

    // First task position 1
    if (!otherGroups.some(p => p.GroupId !== CalendarTaskService.UnassignedId)) {
      this.currentGroup.Position = 1;
      this.currentGroup.InitialPosition = 500;
    } else {
      this.currentGroup.Position = Math.max(...otherGroups.map(p => p.Position)) + 1;
      this.currentGroup.InitialPosition = 500;
    }

    // FILL UNASSIGNED
    // TODO: we could call GetAllPresentTasks instead but for now we show all tasks
    for (const task of this.calendarTaskService.getAllPresentTasks()) {
      // TODO: Remove this later, same for edit/create
      if (task.GroupId == null || task.GroupId.length === 0) {
        task.GroupId = CalendarTaskService.UnassignedId;
        //console.log('FILLED UNASSIGNED : ', task.GroupId);
      }

      if (task.GroupId === CalendarTaskService.UnassignedId) {
        const selectableTask = new TaskSelectionViewModel();
        selectableTask.calendarTaskId = task.CalendarTaskId;
        selectableTask.Name = task.Name;
        selectableTask.isChecked = false;
        this.selectableTasks.push(selectableTask);
      }
    }

    this.selectAllChecked = false;

    // Set all other groups
    for (const group of otherGroups) {
      const groupViewModel = new GroupPositionViewModel();
      groupViewModel.Name = group.Name;
      groupViewModel.groupId = group.GroupId;
      groupViewModel.isSelected = false;
      groupViewModel.Position = group.Position;
      this.allOtherGroups.push(groupViewModel);
    }

    // Set After Group
    const maxPosition = Math.max(...this.allOtherGroups.map(p => p.Position));
    const index = this.allOtherGroups.findIndex(p => p.Position === maxPosition);
    this.selectedAfterGroup = this.allOtherGroups[index];
    this.selectedAfterGroup.isSelected = true;

    this.currentGroup.Position = maxPosition + 1;
  }

  public async closePopup(): Promise<void> {
    await this.modalController.dismiss(false, null, ModalService.ModalIds.CreateGroup);
  }

  ngOnDestroy(): void {
    this.backButtonSubscription.unsubscribe();
  }

  public checkAllClick(): void {
    const result = !this.selectAllChecked;

    for (const task of this.selectableTasks) {
      task.isChecked = result;
    }
  }

  public async btnSaveClick(): Promise<void> {
    try {
      this.currentGroup.validate(this.translate);
    } catch (error) {
      if (error instanceof InvalidTaskGroupError) {
        // console.log('error04');
        this.logger.logError(new Error('invalidtaskgrouperror'), { key: 'error', value: JSON.stringify(error)});
        alert(error.message);
        return;
      }
    }

    const loading = await this.loadingController.create({
      message: this.translate.instant('group-create.msg-saving'),
    });
    loading.present();

    try {

      // Save all GroupIds // TODO: Move into insertGroup ?
      // const selectedTasks: CalendarTask[] = [];
      for (const taskViewModel of this.selectableTasks) {
        if (taskViewModel.isChecked) {
          const task = this.calendarTaskService.getTask(taskViewModel.calendarTaskId);
          task.Synced = false;
          task.GroupId = this.currentGroup.GroupId;
          this.currentGroup.Tasks.push(task);
        }
      }

      // Save Group
      await this.calendarTaskService.insertGroup(this.currentGroup);

      await this.modalController.dismiss(true, null, ModalService.ModalIds.CreateGroup);

      // Refresh TaskList
      // Handle Errors
    } catch (error) {
      this.logger.logError(error);
      // console.log('ERROR SAVING GROUP', error);
      alert('error saving group');
    } finally {
      loading.dismiss();
    }
  }

  public async btnEditPositionClick() {
    const handlerOk: (alertData: any) => void = (alertData) => {
      this.selectedAfterGroup = this.allOtherGroups.filter(p => p.Name === alertData)[0];
      this.absolutePositionChange(this.selectedAfterGroup.Position);
    };

    const handlerCancel: (alertData: any) => void = (alertData) => {
      return;
    };

    const handlerSetAsFirst: (alertData: any) => void = (alertData) => {
      this.setToFirst();
    };

    const alertOptions: AlertOptions = this.alertService.getChangeGroupPositionAlertOptions(handlerOk,
                                                                                            handlerCancel,
                                                                                            handlerSetAsFirst,
                                                                                            this.allOtherGroups.map(p => p.Name),
                                                                                            this.selectedAfterGroup.Name);
    const alert = await this.alertCtrl.create(alertOptions);

    await alert.present();

    this.setBackButtonAlert(alert);
    await alert.onDidDismiss();
    this.resetBackButton();
  }

  private setBackButtonAlert(alert: HTMLIonAlertElement) {
    this.backButtonSubscription.unsubscribe();
    this.backButtonSubscription = this.platform.backButton.subscribe(async () => {
      await alert.dismiss();
    });
  }

  private resetBackButton() {
    if (this.backButtonSubscription != null) {
      this.backButtonSubscription.unsubscribe();
    }

    this.backButtonSubscription = this.platform.backButton.subscribe(async () => {
      await this.closePopup();
    });
  }

  public setToFirst(): void {
    this.currentGroup.Position = 1;
    this.selectedAfterGroup = null;
  }

  public absolutePositionChange(absolutePosition: number) {
    this.currentGroup.Position = absolutePosition + 1;
  }

  public async taskTypeChanged(event: any) {
    if (event.detail.value === 'Once') {
      this.currentGroup.RecurringDefault = false;
    } else {
      this.currentGroup.RecurringDefault = true;
    }
  }
}

export class TaskSelectionViewModel {
  public calendarTaskId: string;
  public Name: string;
  public isChecked: boolean;
}

export class GroupPositionViewModel {
  public groupId: string;
  public Name: string;
  public Position: number;
  public isSelected: boolean;
}
