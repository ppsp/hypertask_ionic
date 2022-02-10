import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { ModalController, Platform, LoadingController, AlertController } from '@ionic/angular';
import { TaskGroup } from 'src/app/models/Core/task-group';
import { CalendarTaskService } from 'src/app/services/calendar-task.service';
import { TranslateService } from '@ngx-translate/core';
import { ILogger } from 'src/app/interfaces/i-logger';
import { AlertService } from 'src/app/services/alert.service';
import { AlertOptions } from '@ionic/core';
import { IDataSyncLocalService } from 'src/app/interfaces/i-data-sync-local-service';
import { TaskSelectionViewModel, GroupPositionViewModel } from '../group-create/group-create.component';
import { InvalidTaskGroupError } from 'src/app/models/Exceptions/InvalidTaskGroupError';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-group-edit',
  templateUrl: './group-edit.component.html',
  styleUrls: ['./group-edit.component.scss'],
})
export class GroupEditComponent implements OnInit, OnDestroy {

  private backButtonSubscription: Subscription;

  @Input() currentGroup: TaskGroup;
  public selectableTasks: TaskSelectionViewModel[] = [];
  public selectedAfterGroup: GroupPositionViewModel;
  public allOtherGroups: GroupPositionViewModel[] = [];
  public selectAllChecked: boolean;
  public taskTypeValue: string = 'Once';

  constructor(private modalController: ModalController,
              private platform: Platform,
              private calendarTaskService: CalendarTaskService,
              private translate: TranslateService,
              private logger: ILogger,
              private loadingController: LoadingController,
              private localDataSync: IDataSyncLocalService,
              private alertCtrl: AlertController,
              private alertService: AlertService) { }

  ngOnInit() {
    this.resetBackButton();

    // FILL UNASSIGNED
    // TODO: we could call GetAllPresentTasks instead but for now we show all tasks
    for (const task of this.calendarTaskService.getAllPresentTasks()) {
      // TODO: Remove this later, same for edit/create
      if (task.GroupId == null || task.GroupId.length === 0) {
        task.GroupId = CalendarTaskService.UnassignedId;
      }

      if (task.GroupId === CalendarTaskService.UnassignedId ||
          task.GroupId === this.currentGroup.GroupId) {

        const selectableTask = new TaskSelectionViewModel();
        selectableTask.calendarTaskId = task.CalendarTaskId;
        selectableTask.Name = task.Name;
        selectableTask.isChecked = task.GroupId === this.currentGroup.GroupId;
        this.selectableTasks.push(selectableTask);
      }
    }

    this.selectAllChecked = false;

    const otherGroups = this.calendarTaskService.allGroups
                                                .filter(p => p.GroupId !== this.currentGroup.GroupId &&
                                                              p.Void !== true)
                                                .sort((x, y) => x.Position > y.Position ? 1 : -1);

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
    const afterGroups = this.allOtherGroups.filter(p => p.Position < this.currentGroup.Position);

    if (afterGroups.length > 0) {
      this.selectedAfterGroup = afterGroups[afterGroups.length - 1];
      this.selectedAfterGroup.isSelected = true;
    }

    if (this.currentGroup.Position === 0) {
      this.currentGroup.Position = 1;
    }

    this.taskTypeValue = this.currentGroup.RecurringDefault === true ? 'Recurring' : 'Once';
  }

  ngOnDestroy(): void {
    this.backButtonSubscription.unsubscribe();
  }

  public async closePopup(): Promise<void> {
    await this.modalController.dismiss(false, null, ModalService.ModalIds.EditGroup);
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
      // Save Group
      this.currentGroup.UpdateDate = new Date();

      // Verify all tasks in list, if they changed, update it
      // const selectedTasks: CalendarTask[] = [];
      for (const selectableTask of this.selectableTasks) {
        const task = this.calendarTaskService.getTask(selectableTask.calendarTaskId);

        if (selectableTask.isChecked && task.GroupId !== this.currentGroup.GroupId) {
          task.Synced = false;
          task.GroupId = this.currentGroup.GroupId;
          this.currentGroup.Tasks.push(this.calendarTaskService.getTask(selectableTask.calendarTaskId));
          await this.localDataSync.queueUpdateCalendarTask(task.toDTO(), false);

          // First add, make it visible
          if (this.currentGroup.Tasks.length === 1) {
            this.currentGroup.isVisible = true;
          }

          // selectedTasks.push(this.calendarTaskService.getTask(selectableTask.calendarTaskId));
        } else if (!selectableTask.isChecked && task.GroupId === this.currentGroup.GroupId) {
          task.Synced = false;
          task.GroupId = CalendarTaskService.UnassignedId;
          await this.localDataSync.queueUpdateCalendarTask(task.toDTO(), false);
          const index = this.currentGroup.Tasks.findIndex(p => p.CalendarTaskId === selectableTask.calendarTaskId);
          this.currentGroup.Tasks.splice(index, 1);

          // Last Remove, make it invisible
          if (this.currentGroup.Tasks.length === 0) {
            this.currentGroup.isVisible = false;
          }
        }
      }

      // TODO : This await might be removable
      await this.calendarTaskService.updateGroup(this.currentGroup);
      await this.modalController.dismiss(true, null, ModalService.ModalIds.EditGroup);

      // Refresh TaskList
      // Handle Errors
    } catch (error) {
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

    this.setBackButtonAlert(alert);
    await alert.onDidDismiss();
    this.resetBackButton();
  }

  public async btnDeleteClick() {
    const handler: (alertData: any) => void = (alertData) => {
      this.deleteGroup();
    };

    const alertOptions: AlertOptions = this.alertService.getDeleteGroupAlertOptions(handler);
    const alert = await this.alertCtrl.create(alertOptions);
    await alert.present();

    this.setBackButtonAlert(alert);
    await alert.onDidDismiss();
    this.resetBackButton();
  }

  private async deleteGroup(): Promise<void> {
    /*const loading = await this.loadingController.create({
      message: this.translate.instant('edit-task.msg-deleting-task'),
    });
    loading.present();*/
    // console.log('deleting started', new Date().toISOString());
    this.currentGroup.Void = true;
    this.currentGroup.VoidDate = new Date();
    this.currentGroup.isVisible = false;
    const result = await this.calendarTaskService.updateGroup(this.currentGroup);
    try {
      // loading.dismiss();
      if (result === true) {
        await this.modalController.dismiss(true, null, ModalService.ModalIds.EditGroup);
      } else {
        this.logger.logError(new Error('Unable to delete this task, result is false'));
      }
      return;
    } catch (error) {
      // loading.dismiss();
      this.logger.logError(new Error('Unable to delete this task : ' + error.message));
      alert('Unable to delete this task');
      return;
    }
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
