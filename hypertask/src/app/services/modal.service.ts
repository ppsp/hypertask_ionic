import { Injectable } from '@angular/core';
import { LoadingController, ModalController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ILogger } from '../interfaces/i-logger';
import { CalendarTask } from '../models/Core/calendar-task';
import { TaskGroup } from '../models/Core/task-group';
import { EventData, EventService } from './event.service';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  public static ModalIds = class {
    public static CreateTask = 'CreateTaskModal';
    public static EditTask = 'EditTaskModal';
    public static CreateGroup = 'CreateGroupModal';
    public static EditGroup = 'EditGroupModal';
    public static Feedback = 'FeedbackModal';
    public static Notes = 'NotesModal';
    public static Logs = 'LogsModal';
    public static UserSettings = 'UserSettingsModal';
    public static TaskSelection = 'TaskSelectionModal';
    public static Privacy = 'PrivacyModal';
    public static Terms = 'TermsModal';
    public static Groups = 'GroupsModal';
    public static AssignedDate = 'AssignedDateModal';
    public static Welcome = 'WelcomeModal';
    public static CurrentDate = 'CurrentDate';
  };

  private static shownModalIds: string[] = [];

  constructor(private modalController: ModalController,
              private eventService: EventService,
              private translate: TranslateService,
              private loadingController: LoadingController,
              private logger: ILogger,
              private platform: Platform) {
  }

  public async showCreateTaskModal(component, groupId: string = ""): Promise<void> {
    // PREVENT DUPLICATE MODAL
    const modalId = ModalService.ModalIds.CreateTask;
    if (ModalService.shownModalIds.some(p => p === modalId)) {
      return;
    } else {
      ModalService.shownModalIds.push(modalId);
    }

    // console.log('CREATE CLICK', new Date().toISOString());
    const modal = await this.modalController.create({
      component,
      backdropDismiss: false,
      id: modalId,
      componentProps: { preSelectedGroupId: groupId }
    });

    modal.present().then(() => {
      const firstInput: any = document.querySelector('ion-modal input');
      firstInput.focus();
    });

    // console.log('CREATE PRESENTED', new Date().toISOString());
    await modal.onDidDismiss();

    ModalService.shownModalIds = ModalService.shownModalIds.filter(p => p !== modalId);
    this.eventService.emit(new EventData(EventService.EventIds.ProgressBar, null));

    return;
  }

  public async showEditTaskModal(component, task: CalendarTask): Promise<void> {
    const modalId = ModalService.ModalIds.EditTask;
    if (ModalService.shownModalIds.some(p => p === modalId)) {
      return;
    } else {
      ModalService.shownModalIds.push(modalId);
    }

    const modal2 = await this.modalController.create({
      component,
      backdropDismiss: false,
      componentProps: {
        currentTask: task,
      },
      id: modalId
    });
    await modal2.present();
    await modal2.onWillDismiss();

    ModalService.shownModalIds = ModalService.shownModalIds.filter(p => p !== modalId);

    return;
  }


  public async showCreateGroupModal(component): Promise<boolean> {
    const modalId = ModalService.ModalIds.CreateGroup;
    if (ModalService.shownModalIds.some(p => p === modalId)) {
      return;
    } else {
      ModalService.shownModalIds.push(modalId);
    }

    const modal2 = await this.modalController.create({
      component,
      backdropDismiss: false,
      id: modalId
    });

    await modal2.present();
    const firstInput: any = document.querySelector('app-group-create input');
    firstInput.focus();

    const subscription = this.platform.backButton.subscribe(async () => {
      await modal2.dismiss();
    });
    const data = await modal2.onDidDismiss();
    subscription.unsubscribe();

    ModalService.shownModalIds = ModalService.shownModalIds.filter(p => p !== modalId);
    return data.data as boolean;
  }

  public async showEditGroupModal(component, group: TaskGroup): Promise<boolean> {
    const modalId = ModalService.ModalIds.EditGroup;
    if (ModalService.shownModalIds.some(p => p === modalId)) {
      return;
    } else {
      ModalService.shownModalIds.push(modalId);
    }

    const modal2 = await this.modalController.create({
      component,
      backdropDismiss: false,
      componentProps: {
        currentGroup: group,
      },
      id: modalId
    });
    await modal2.present();
    const data = await modal2.onDidDismiss();

    ModalService.shownModalIds = ModalService.shownModalIds.filter(p => p !== modalId);
    return data.data as boolean;
  }

  public async showFeedbackModal(component): Promise<void> {
    const modalId = ModalService.ModalIds.Feedback;
    if (ModalService.shownModalIds.some(p => p === modalId)) {
      // this.logger.logDebug('FeedbackModal already shown');
      return;
    } else {
      // this.logger.logDebug('FeedbackModal not shown, showing');
      ModalService.shownModalIds.push(modalId);
    }

    const modal = await this.modalController.create({
      component,
      backdropDismiss: false,
      id: modalId,
    });

    await modal.present();

    await modal.onDidDismiss();

    // this.logger.logDebug('FeedbackModal dismissed');

    ModalService.shownModalIds = ModalService.shownModalIds.filter(p => p !== modalId);
  }

  public async showNotesModal(component): Promise<void> {
    const modalId = ModalService.ModalIds.Notes;
    if (ModalService.shownModalIds.some(p => p === modalId)) {
      return;
    } else {
      ModalService.shownModalIds.push(modalId);
    }

    const modal = await this.modalController.create({
      component,
      backdropDismiss: false,
      id: modalId
    });

    await modal.present();
    await modal.onDidDismiss();

    ModalService.shownModalIds = ModalService.shownModalIds.filter(p => p !== modalId);
  }

  public async showLogsModal(component): Promise<void> {
    const modalId = ModalService.ModalIds.Logs;
    if (ModalService.shownModalIds.some(p => p === modalId)) {
      return;
    } else {
      ModalService.shownModalIds.push(modalId);
    }

    const loading = await this.loadingController.create({
      message: this.translate.instant('menu.msg-show-logs')
    });
    await loading.present();
    const modal = await this.modalController.create({
      component,
      backdropDismiss: false,
      id: modalId
    });

    await modal.present();
    await loading.dismiss();
    await modal.onDidDismiss();

    ModalService.shownModalIds = ModalService.shownModalIds.filter(p => p !== modalId);
  }

  public async showUserSettingsModal(component): Promise<void> {
    const modalId = ModalService.ModalIds.UserSettings;
    if (ModalService.shownModalIds.some(p => p === modalId)) {
      return;
    } else {
      ModalService.shownModalIds.push(modalId);
    }

    const loading = await this.loadingController.create({
      message: this.translate.instant('menu.load-settings'),
    });
    await loading.present();
    const modal = await this.modalController.create({
      component,
      backdropDismiss: false,
      id: modalId
    });

    modal.present();
    await loading.dismiss();
    await modal.onDidDismiss();

    ModalService.shownModalIds = ModalService.shownModalIds.filter(p => p !== modalId);
  }

  public async showTaskSelectionModal(component): Promise<void> {
    const modalId = ModalService.ModalIds.TaskSelection;
    if (ModalService.shownModalIds.some(p => p === modalId)) {
      return;
    } else {
      ModalService.shownModalIds.push(modalId);
    }

    const loading = await this.loadingController.create({
      message: this.translate.instant('menu.loading-task-selection'),
    });
    await loading.present();
    const modal = await this.modalController.create({
      component,
      backdropDismiss: false,
      id: modalId
    });

    await modal.present();
    await loading.dismiss();
    await modal.onDidDismiss();

    ModalService.shownModalIds = ModalService.shownModalIds.filter(p => p !== modalId);
  }

  public async showPrivacyModal(component): Promise<void> {
    const modalId = ModalService.ModalIds.Privacy;
    if (ModalService.shownModalIds.some(p => p === modalId)) {
      return;
    } else {
      ModalService.shownModalIds.push(modalId);
    }

    const modal = await this.modalController.create({
      component,
      backdropDismiss: false,
      id: modalId
    });

    modal.present();
    await modal.onDidDismiss();

    ModalService.shownModalIds = ModalService.shownModalIds.filter(p => p !== modalId);
  }

  public async showTermsModal(component): Promise<void> {
    const modalId = ModalService.ModalIds.Terms;
    if (ModalService.shownModalIds.some(p => p === modalId)) {
      return;
    } else {
      ModalService.shownModalIds.push(modalId);
    }

    const modal = await this.modalController.create({
      component,
      backdropDismiss: false,
      id: modalId
    });

    modal.present();
    await modal.onDidDismiss();

    ModalService.shownModalIds = ModalService.shownModalIds.filter(p => p !== modalId);
  }

  public async showGroupsModal(component): Promise<void> {
    const modalId = ModalService.ModalIds.Groups;
    if (ModalService.shownModalIds.some(p => p === modalId)) {
      return;
    } else {
      ModalService.shownModalIds.push(modalId);
    }

    const modal = await this.modalController.create({
      component,
      backdropDismiss: false,
      id: modalId
    });

    modal.present();
    await modal.onDidDismiss();

    ModalService.shownModalIds = ModalService.shownModalIds.filter(p => p !== modalId);
  }

  public async showAssignedDateModal(component, datePickerObj, task: CalendarTask): Promise<any> {
    const modalId = ModalService.ModalIds.AssignedDate;
    if (ModalService.shownModalIds.some(p => p === modalId)) {
      return;
    } else {
      ModalService.shownModalIds.push(modalId);
    }

    const datePickerModal = await this.modalController.create({
      component,
      cssClass: 'li-ionic4-datePicker',
      componentProps: {
         objConfig: datePickerObj,
         selectedDate: task.AssignedDate
      },
      id: modalId
    });
    await datePickerModal.present();

    const data = await datePickerModal.onDidDismiss();

    ModalService.shownModalIds = ModalService.shownModalIds.filter(p => p !== modalId);

    return data;
  }

  public async showWelcomeModal(component): Promise<void> {
    const modalId = ModalService.ModalIds.Welcome;
    if (ModalService.shownModalIds.some(p => p === modalId)) {
      return;
    } else {
      ModalService.shownModalIds.push(modalId);
    }

    const modal = await this.modalController.create({
      component,
      backdropDismiss: false,
      id: modalId
    });

    modal.present();
    await modal.onDidDismiss();

    ModalService.shownModalIds = ModalService.shownModalIds.filter(p => p !== modalId);
  }

  public async showCurrentDateModal(component, datePickerObj, selectedDate: Date): Promise<any> {
    const modalId = ModalService.ModalIds.CurrentDate;
    if (ModalService.shownModalIds.some(p => p === modalId)) {
      return null;
    } else {
      ModalService.shownModalIds.push(modalId);
    }

    const datePickerModal = await this.modalController.create({
      component,
      cssClass: 'li-ionic4-datePicker',
      componentProps: {
         objConfig: datePickerObj,
         selectedDate
      },
      id: modalId
    });
    await datePickerModal.present();

    const data = await datePickerModal.onDidDismiss();

    ModalService.shownModalIds = ModalService.shownModalIds.filter(p => p !== modalId);

    return data;
  }
}
