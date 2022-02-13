import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CalendarTask } from 'src/app/models/Core/calendar-task';
import { CalendarTaskService } from 'src/app/services/calendar-task.service';
import { ModalController, AlertController, LoadingController, Platform, PickerController } from '@ionic/angular';
import { DayOfWeek } from 'src/app/models/Core/day-of-week.enum';
import { AlertService } from 'src/app/services/alert.service';
import { AlertOptions } from '@ionic/core';
import { FormatDayOfWeekAbbrPipe } from 'src/app/pipes/format-dayofweek-abbr-pipe';
import { TaskFrequency } from 'src/app/models/Core/task-frequency.enum';
import DateUtils from 'src/app/shared/date-utils';
import { DatePipe } from '@angular/common';
import { InvalidCalendarTaskError } from 'src/app/models/Exceptions/InvalidCalendarTaskError';
import { ILogger } from 'src/app/interfaces/i-logger';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { IUserService } from 'src/app/interfaces/i-user-service';
import { Ionic4DatepickerModalComponent } from '@logisticinfotech/ionic4-datepicker';
import { DateService } from 'src/app/services/date.service';
import { UserConfig } from 'src/app/models/Core/user-config';
import { TaskGroup } from 'src/app/models/Core/task-group';
import { ResultType } from 'src/app/models/Core/result-type.enum';
import { EventService, EventData } from 'src/app/services/event.service';
//import { NotificationService } from 'src/app/services/notification.service';
import { GroupCreateComponent } from '../group-create/group-create.component';
import { ModalService } from 'src/app/services/modal.service';
import NumberUtils from 'src/app/shared/number-utils';

@Component({
  selector: 'app-task-edit',
  templateUrl: './task-edit.component.html',
  styleUrls: ['./task-edit.component.scss'],
})
export class TaskEditComponent implements OnInit, OnDestroy {

  private hourChoices: string[] = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11',
                                   '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];

  public ChosenDayOnlyValue: string = 'ChosenDayOnly';
  public UntilDoneValue: string = 'UntilDone';

  @Input() currentTask: CalendarTask;
  public selectedFrequency: string = '0';
  public selectedResultType: string = '0';
  public selectedPositive: string = '0';
  public otherTasks: CalendarTask[]; /* Required in order to select the AbsolutePosition */
  private initialTask: CalendarTask;
  public selectedAfterTask: CalendarTask; /* ngModel of the AbsolutePosition property */
  public selectedGroup: TaskGroup;
  public groups: TaskGroup[];
  public assignedDatePicked: string;

  public showRequiredDays: boolean;
  public showAssignedDate: boolean;
  public recurringValue: any;
  public currentAssignedDateString: string;

  public showSingleDay: boolean;
  private recurringSelected: boolean;
  private onceSelected: boolean;
  private backButtonSubscription: Subscription;
  public notificationEnabled: boolean;
  public notificationTimeValue: string;

  private datePickerObj: any = {};
  public untilDoneCurrentValue: string;
  private isInitialized: boolean = false;

  public selectedResultTypeCaption: string;
  private resultTypeCaptions = [
    this.translate.instant('create-task.select-binary'),
    this.translate.instant('create-task.select-decimal'),
    this.translate.instant('create-task.select-time-of-day'),
    this.translate.instant('create-task.select-time-duration')
  ];

  public daysOfWeek: DayOfWeek[] = [
    DayOfWeek.Monday,
    DayOfWeek.Tuesday,
    DayOfWeek.Wednesday,
    DayOfWeek.Thursday,
    DayOfWeek.Friday,
    DayOfWeek.Saturday,
    DayOfWeek.Sunday
  ];

  constructor(
    private calendarTaskService: CalendarTaskService,
    private modalController: ModalController,
    private alertCtrl: AlertController,
    private logger: ILogger,
    private loadingController: LoadingController,
    public formatDayOfWeekAbbrPipe: FormatDayOfWeekAbbrPipe,
    private alertService: AlertService,
    private datepipe: DatePipe,
    private translate: TranslateService,
    private platform: Platform,
    private userService: IUserService,
    private dateService: DateService,
    private eventService: EventService,
    private pickerCtrl: PickerController,
    //private notificationService: NotificationService,
    private modalService: ModalService) { }

  async ngOnInit() {
    this.recurringValue = this.currentTask.Frequency === TaskFrequency.Once ||
                          this.currentTask.Frequency === TaskFrequency.UntilDone ? 'Once' : 'Recurring';
    this.selectedFrequency = String(Number(this.currentTask.Frequency));
    this.selectedResultType = String(Number(this.currentTask.ResultType));
    this.groups = this.calendarTaskService.allGroups.filter(p => p.Void === false);
    await this.initializeGroup();
    await this.refreshOtherTasks();
    this.setAfterTask();

    if (this.currentTask.AssignedDate == null) {
      this.assignedDatePicked = new Date().toISOString();
    } else {
      this.assignedDatePicked = new Date(this.currentTask.AssignedDate).toISOString();
    }

    if (this.currentTask.Frequency === TaskFrequency.Daily) {
      this.recurringSelected = true;
      this.onceSelected = false;
      this.showSingleDay = false;
    } else {
      if (this.currentTask.Frequency === TaskFrequency.Once) {
        this.onceSelected = true;
        this.recurringSelected = false;
        this.showSingleDay = true;
      } else {
        this.onceSelected = false;
        this.recurringSelected = false;
        this.showSingleDay = true;
      }
    }

    this.setShownComponents();

    this.resetBackButton();

    // console.log('ASSIGNED_DATE = ', this.currentTask.AssignedDate);
    const result = this.datepipe.transform(this.currentTask.AssignedDate, 'yyyy-MM-dd');
    this.currentAssignedDateString = result;

    this.initialTask = Object.assign({}, this.currentTask);

    if (this.currentTask.Frequency === TaskFrequency.Once) {
      this.untilDoneCurrentValue = this.ChosenDayOnlyValue;
    } else if (this.currentTask.Frequency === TaskFrequency.UntilDone) {
      this.untilDoneCurrentValue = this.UntilDoneValue;
    }

    this.selectedResultTypeCaption = this.resultTypeCaptions[this.currentTask.ResultType];

    // console.log('TASK CREATE GROUPS', this.groups);

    // TODO : Might need to put this into afterViewInit

    if (this.currentTask.NotificationId != null) {
      this.notificationEnabled = true;
      if (this.currentTask.NotificationTime != null) {
        this.notificationTimeValue = this.currentTask.NotificationTime;
      } else {
        this.notificationTimeValue = '12:00';
      }
    } else {
      this.notificationEnabled = false;
      this.notificationTimeValue = '12:00';
    }

    this.isInitialized = true;
  }

  ngOnDestroy(): void {
    this.backButtonSubscription.unsubscribe();
  }

  public async btnSaveClick(): Promise<void> {

    if (this.recurringSelected) {
      this.currentTask.Frequency = TaskFrequency.Daily;
    } else {
      if (this.onceSelected) {
        this.currentTask.Frequency = TaskFrequency.Once;
      } else {
        this.currentTask.Frequency = TaskFrequency.UntilDone;
      }
    }

    this.currentTask.GroupId = this.selectedGroup.GroupId;

    try {
      this.currentTask.validate(this.translate);
    } catch (error) {
      if (error instanceof InvalidCalendarTaskError) {
        // console.log('invalidcalendartaskerror', error);
        alert(error.message);
        return;
      }
    }

    // Validation 1
    if (this.currentTask.Frequency !== TaskFrequency.Daily) { // TODO : this will cause a bug if the task can't be created
      this.currentTask.RequiredDays = [];
    }

    // Validation 2
    if (this.currentTask.Frequency === TaskFrequency.Daily) { // TODO : this will cause a bug if the task can't be created
      this.currentTask.AssignedDate = null;
    }

    // Notifications
    // console.log('notification enabled', this.notificationEnabled);
    // console.log('notification id', this.currentTask.NotificationId);
    if (this.notificationEnabled === true &&
        (this.currentTask.NotificationId == null ||
        Number.isNaN(this.currentTask.NotificationId))) {
      this.logger.logDebug('SETTING NOTIFICATION ID');
      this.currentTask.NotificationId = Math.max(...this.calendarTaskService.getAllTasks()
                                                        .filter(p => p.NotificationId < 1000000).map(p => p.NotificationId)) + 1;
      if (Number.isNaN(this.currentTask.NotificationId)) {
        this.logger.logDebug('IS NAN, SETTING NOTIFICATION ID TO 1');
        this.currentTask.NotificationId = 1;
        if (this.calendarTaskService.getAllTasks().filter(p => p.NotificationId === 1 && p.Void === false).length > 0) {
          // 1 already exists
          this.logger.logError(new Error('NotificationId = 1 already exists'));
        }
      } else {
        this.logger.logDebug('SETTING NOTIFICATION TO ' + this.currentTask.NotificationId);
      }
    }

    this.logger.logDebug('NOTIFICATIONID=', String(this.currentTask.NotificationId));

    if (this.notificationEnabled === false && this.currentTask.NotificationId != null) {
      // console.log('CANCELLING ALL NOTIFICATIONS');
      //await this.notificationService.cancelAllNotification(this.currentTask.NotificationId); TODO CAPACITOR
      this.currentTask.NotificationId = null;
      this.currentTask.NotificationTime = null;
    }

    const loading = await this.loadingController.create({
      message: this.translate.instant('edit-task.msg-saving-task'),
    });
    loading.present();

    this.currentTask.UserId = await this.userService.getCurrentUserId();
    this.currentTask.UpdateDate = new Date();

    try {
      const result = await this.calendarTaskService.updateCalendarTask(this.currentTask);
      loading.dismiss();
      if (result === true) {
        // this.currentTask.reorderTasks(this.orderChanged, this.allOtherTasks);
        await this.modalController.dismiss(true, null, ModalService.ModalIds.EditTask);
        this.initialTask = null;
        this.eventService.emit(new EventData(EventService.EventIds.CardReset + this.currentTask.CalendarTaskId, true));
        this.eventService.emit(new EventData(EventService.EventIds.ProgressBar, true));
        this.eventService.emit(new EventData(EventService.EventIds.NotificationSyncedFalse, null));
      } else {
        this.logger.logError(new Error('Unable to save task, result is false'));
        alert(this.translate.instant('edit-task.msg-saving-task-error'));
      }
    } catch (error) {
      loading.dismiss();
      this.logger.logError(new Error('Unable to save task : ' + error.message));
      alert('Unable to save task');
      return;
    }
  }

  public async btnAssignedDateClick() {
    const datePickerModal = await this.modalController.create({
      component: Ionic4DatepickerModalComponent,
      cssClass: 'li-ionic4-datePicker',
      componentProps: {
         objConfig: this.datePickerObj,
         selectedDate: this.dateService.GetTodayWorkDate()
      }
    });
    await datePickerModal.present();

    this.setBackButtonModal(datePickerModal);
    const data = await datePickerModal.onDidDismiss();
    this.resetBackButton();

    const selectedDate = new Date(data.data.date);

    if (!DateUtils.isValidDate(selectedDate)) { // standard cancel
      return;
    }

    this.currentAssignedDateString = this.datepipe.transform(selectedDate, 'yyyy-MM-dd');
    this.currentTask.AssignedDate = DateUtils.RemoveHours(selectedDate);
  }

  public cbDayOfWeek(event: any, dayOfWeek: number): void {
    if (event.detail.checked) {
      this.currentTask.RequiredDays.push(dayOfWeek);
    } else {
      this.currentTask.RequiredDays = this.currentTask.RequiredDays.filter(p => p.valueOf() !== dayOfWeek);
    }
  }

  public getCbDayOfWeekValue(day: number): boolean {
    // TODO: this gets called 7*7 times instead of 7 times
    if (this.currentTask.RequiredDays.some(p => p === day)) {
      return true;
    } else {
      return false;
    }
  }

  public async btnDeleteClick() {
    const handler: (alertData: any) => void = (alertData) => {
      this.deleteTask();
    };

    const alertOptions: AlertOptions = this.alertService.getDeleteTaskAlertOptions(handler);
    const alert = await this.alertCtrl.create(alertOptions);
    await alert.present();

    this.setBackButtonAlert(alert);
    await alert.onDidDismiss();
    this.resetBackButton();
  }

  public async selectResultType() {
    const handlerOk: (alertData: any) => void = (alertData) => {
      for (let i = 0 ; i < 4 ; i++) {
        if (this.resultTypeCaptions[i] === alertData) {
          this.currentTask.ResultType = i as ResultType;
          this.selectedResultTypeCaption = this.resultTypeCaptions[i];
          break;
        }
      }
    };

    const handlerCancel: (alertData: any) => void = (alertData) => {
      return;
    };

    // TODO: Implement a default result type
    /*const handlerSetAsDefault: (alertData: any) => void = (alertData) => {
      this.selectedGroup = this.groups.filter(p => p.Name === alertData)[0];
      this.selectedAfterTask = null;

      console.log('SETTING AS DEFAULT', this.selectedGroup);

      if (this.recurringSelected) {
        this.userService.setDefaultRecurringGroupId(this.selectedGroup.GroupId);
      } else {
        this.userService.setDefaultNonRecurringGroupId(this.selectedGroup.GroupId);
      }

      // this.selectedGroup = this.groups.filter(p => p.Name === alertData)[0];
    };*/

    const alertOptions: AlertOptions = this.alertService.getChangeResultTypeOptions(handlerOk,
                                                                                    handlerCancel,
                                                                                    // handlerSetAsDefault,
                                                                                    this.resultTypeCaptions,
                                                                                    this.selectedResultTypeCaption);
    const alert = await this.alertCtrl.create(alertOptions);
    await alert.present();

    this.setBackButtonAlert(alert);
    await alert.onDidDismiss();
    this.resetBackButton();
  }

  private async deleteTask(): Promise<void> {
    this.currentTask.Void = true;
    this.currentTask.UserId = await this.userService.getCurrentUserId();
    const result = await this.calendarTaskService.updateCalendarTask(this.currentTask);
    try {
      if (result === true) {
        this.eventService.emit(new EventData(EventService.EventIds.CardReset + this.currentTask.CalendarTaskId, true));
        this.eventService.emit(new EventData(EventService.EventIds.ProgressBar, true));
        await this.modalController.dismiss(true, null, ModalService.ModalIds.EditTask);
      } else {
        this.logger.logError(new Error('Unable to delete this task, result is false'));
      }
      return;
    } catch (error) {
      this.logger.logError(new Error('Unable to delete this task : ' + error.message));
      alert('Unable to delete task');
      return;
    }
  }

  public setToFirst(): void {
    this.currentTask.AbsolutePosition = 1;
    this.selectedAfterTask = null;
  }

  public absolutePositionChange(absolutePosition: number) {
    this.currentTask.AbsolutePosition = absolutePosition + 1;
  }

  public async recurringChanged(event: any) {
    if (this.isInitialized === false) {
      return;
    }

    // console.log('recurring changed', event);
    if (event.detail.value === 'Once') {
      this.showAssignedDate = true;
      this.showRequiredDays = false;
      this.showSingleDay = true;
      this.recurringSelected = false;
      if (this.currentTask.Frequency !== TaskFrequency.Once &&
          this.currentTask.Frequency !== TaskFrequency.UntilDone) {
        this.untilDoneCurrentValue = this.UntilDoneValue;
        this.currentAssignedDateString = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
        this.currentTask.AssignedDate = this.dateService.GetTodayWorkDate();
      }

      // Ask if we want to change to the default group
      const defaultGroupId = this.userService.getConfig(UserConfig.DefaultNonRecurringGroupId);
      const defaultAfterTaskName = defaultGroupId == null ?
                                     null :
                                     this.userService.getConfig(UserConfig.DefaultNonRecurringAfterTaskNameKey);
      await this.changeDefaultGroup(defaultGroupId, defaultAfterTaskName);
    } else {
      this.showAssignedDate = false;
      this.showRequiredDays = true;
      this.showSingleDay = false;
      this.recurringSelected = true;

      // Ask if we want to change to the default group
      const defaultGroupId = this.userService.getConfig(UserConfig.DefaultRecurringGroupId);
      const defaultAfterTaskName = defaultGroupId == null ?
                                      null :
                                      this.userService.getConfig(UserConfig.DefaultRecurringAfterTaskNameKey);
      await this.changeDefaultGroup(defaultGroupId, defaultAfterTaskName);

      // Reset Assigned Date if it was null
      if (this.initialTask.AssignedDate == null) {
        this.currentTask.AssignedDate = null;
      }
    }
  }

  private async changeDefaultGroup(defaultGroupId: string, defaultAfterTaskName: string) {
    if (defaultGroupId != null &&
      this.selectedGroup != null &&
      defaultGroupId !== this.selectedGroup.GroupId) {
      const defaultGroup = this.calendarTaskService.getGroup(defaultGroupId);
      const handler: (alertData: any) => void = async (alertData) => {
        this.selectedGroup = defaultGroup;
        this.currentTask.GroupId = this.selectedGroup.GroupId;

        await this.refreshOtherTasks();

        // Get default position
        if (this.selectedGroup != null && defaultAfterTaskName != null &&
          this.otherTasks.some(p => p.Name === defaultAfterTaskName &&
            p.GroupId === this.selectedGroup.GroupId)) {
          // tslint:disable-next-line:max-line-length
          this.selectedAfterTask = this.otherTasks.filter(p => p.Name === defaultAfterTaskName)[0];
          this.currentTask.AbsolutePosition = this.selectedAfterTask.AbsolutePosition + 1;
        } else {
          this.selectedAfterTask = null;
          this.currentTask.AbsolutePosition = 1;
        }
      };

      const defaultGroupName = defaultGroup.Name;
      const alertOptions = this.alertService.getConfirmChangeGroupAlertOptions(handler, defaultGroupName);
      const alert = await this.alertCtrl.create(alertOptions);
      await alert.present();
    }
  }

  public singleDateChanged(event: any) {
    if (event.detail.value === 'ChosenDayOnly') {
      this.onceSelected = true;
    } else {
      this.onceSelected = false;
    }
  }

  public async btnNotificationEnterTimeClick(): Promise<void> {
    const picker = await this.pickerCtrl.create({
      columns: this.getNotificationColumns(),
      cssClass: 'time-picker',
      animated: false,
      buttons: [
        {
          text: this.translate.instant('alert.lbl-cancel'),
          role: 'cancel'
        },
        {
          text: this.translate.instant('alert.lbl-ok'),
          handler: (value) => {
            const hourString = Number(value.Hours.value) > 9 ?
                                 value.Hours.value :
                                 '0' + value.Hours.value;

            const minutesString = Number(value.Minutes.value) > 9 ?
                                 value.Minutes.value :
                                 '0' + value.Minutes.value;

            this.notificationTimeValue = hourString + ':' + minutesString;

            this.currentTask.NotificationTime = this.notificationTimeValue;
            if (this.currentTask.NotificationId == null) {
              this.currentTask.NotificationId = Math.max(...this.calendarTaskService.getAllTasks()
                                                        .filter(p => p.NotificationId < 1000000).map(p => p.NotificationId)) + 1;
            }
          }
        }
      ]
    });

    await picker.present();

    this.setBackButtonPicker(picker);
    await picker.onDidDismiss();
    this.resetBackButton();
  }

  private getNotificationColumns() {
    const currentHour = Number(this.notificationTimeValue.substring(0, 2));
    // console.log('CURRENT HOUR', currentHour);
    // const currentMinutes = Number(currentSelection.substring(3, 3 + 2));
    const HourIndex = this.hourChoices.findIndex(p => Number(p) === currentHour);
    // console.log('CURRENT HourIndex', HourIndex, this.hourChoices);

    const MinuteIndex = 0;
    const columns = [];

    columns.push({
      name: 'Hours',
      selectedIndex: HourIndex,
      options: this.getColumnOptions1(),
    });

    columns.push({
      name: 'Minutes',
      selectedIndex: MinuteIndex,
      options: this.getColumnOptions2()
    });

    // console.log('columns');

    return columns;
  }

  private getColumnOptions1() {
    const options = [];
    for (const hourValue of this.hourChoices) {
      options.push({
        text: hourValue,
        value: Number(hourValue)
      });
    }

    return options;
  }

  private getColumnOptions2() {
    const options = [];
    for (const minuteValue of UserConfig.getMinutesValues()) {
      options.push({
        text: minuteValue,
        value: Number(minuteValue)
      });
    }

    return options;
  }

  public async closePopup() {
    const anyChanged = !CalendarTask.equals(this.initialTask, this.currentTask);

    if (anyChanged === true) {
      const handlerYes = async () => {
        this.btnSaveClick();
        await this.modalController.dismiss(false, null, ModalService.ModalIds.EditTask);
      };

      const handlerNo = async () => {
        await this.modalController.dismiss(false, null, ModalService.ModalIds.EditTask);
      };

      const alertOptions = this.alertService.getCloseTaskEditPopupAlertOptions(handlerYes, handlerNo);
      const alert = await this.alertCtrl.create(alertOptions);
      await alert.present();
    } else {
      await this.modalController.dismiss(false, null, ModalService.ModalIds.EditTask);
    }
  }

  private setShownComponents() {
    this.showRequiredDays = this.currentTask.Frequency === TaskFrequency.Daily;
    this.showAssignedDate = this.currentTask.Frequency !== TaskFrequency.Daily;
  }

  public async selectGroup() {
    const handlerOk: (alertData: any) => void = async (alertData) => {
      this.selectedGroup = this.groups.filter(p => p.Name === alertData)[0];
      this.selectedAfterTask = null;
      this.currentTask.GroupId = this.selectedGroup.GroupId;

      await this.refreshOtherTasks();
      // console.log('SETTING', this.selectedGroup);
    };

    const handlerCancel: (alertData: any) => void = (alertData) => {
      return;
    };

    const handlerSetAsDefault: (alertData: any) => void = (alertData) => {
      this.selectedGroup = this.groups.filter(p => p.Name === alertData)[0];
      this.selectedAfterTask = null;

      // console.log('SETTING AS DEFAULT', this.selectedGroup);

      if (this.recurringSelected) {
        this.userService.setDefaultRecurringGroupId(this.selectedGroup.GroupId);
      } else {
        this.userService.setDefaultNonRecurringGroupId(this.selectedGroup.GroupId);
      }

      // this.selectedGroup = this.groups.filter(p => p.Name === alertData)[0];
    };

    const handlerNew: (alertData: any) => void = async (alertData) => {
      const result = await this.modalService.showCreateGroupModal(GroupCreateComponent);
      if (result === true) {
        this.groups = this.calendarTaskService.allGroups.filter(p => p.Void === false);
        // select last created group
        this.selectedGroup = this.groups.filter(p => p.Void !== true && p.InsertDate != null)
                              .sort((a, b) => {
                                return b.InsertDate.getTime() - a.InsertDate.getTime();
                              })[0];
        this.selectedAfterTask = null;
        this.currentTask.GroupId = this.selectedGroup.GroupId;
        await this.refreshOtherTasks();
      }
    };

    const currentGroupName = this.selectedGroup != null ?
                                this.selectedGroup.Name :
                                '';

    const alertOptions: AlertOptions = this.alertService.getChangeDefaultGroupAlertOptions(handlerOk,
                                                                                           handlerCancel,
                                                                                           handlerSetAsDefault,
                                                                                           handlerNew,
                                                                                           this.groups.map(p => p.Name),
                                                                                           currentGroupName);
    const alert = await this.alertCtrl.create(alertOptions);
    alert.present();
  }

  public async selectPosition() {
    const handlerOk: (alertData: any) => void = (alertData) => {
      this.selectedAfterTask = this.otherTasks.filter(p => p.Name === alertData)[0];
      this.absolutePositionChange(this.selectedAfterTask.AbsolutePosition);
    };

    const handlerCancel: (alertData: any) => void = (alertData) => {
      return;
    };

    const handlerSetAsDefault: (alertData: any) => void = (alertData) => {
      this.selectedAfterTask = this.otherTasks.filter(p => p.Name === alertData)[0];
      this.absolutePositionChange(this.selectedAfterTask.AbsolutePosition);
    };

    const handlerSetAsFirst: (alertData: any) => void = (alertData) => {
      this.setToFirst();
    };

    const alertOptions: AlertOptions = this.alertService.getChangeDefaultAlertOptions(handlerOk,
                                                                                      handlerCancel,
                                                                                      handlerSetAsDefault,
                                                                                      handlerSetAsFirst,
                                                                                      this.otherTasks.map(p => p.Name),
                                                                                      this.selectedAfterTask != null ?
                                                                                        this.selectedAfterTask.Name :
                                                                                        null);
    const alert = await this.alertCtrl.create(alertOptions);
    alert.present();
  }

  private async initializeGroup() {
    const groupIndex = this.groups.findIndex(p => p.GroupId === this.currentTask.GroupId);
    this.selectedGroup = this.groups[groupIndex];
  }

  private async refreshOtherTasks() {
    this.otherTasks = this.calendarTaskService.getAllPresentTasks()
                                              .filter(p => p.CalendarTaskId !== this.currentTask.CalendarTaskId &&
                                                           p.GroupId === this.currentTask.GroupId &&
                                                           !p.Void);
  }

  private setAfterTask() {
    if (this.otherTasks.length === 0) {
      this.currentTask.AbsolutePosition = 1;
      this.selectedAfterTask = null;
    } else {
      const afterTasks = this.otherTasks.filter(p => p.AbsolutePosition < this.currentTask.AbsolutePosition);
      if (afterTasks.length > 0) {
        this.selectedAfterTask = afterTasks[afterTasks.length - 1];
      }
    }
  }

  private refreshAfterTask() {
    this.currentTask.AbsolutePosition = 1;
    this.selectedAfterTask = null;
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

  private setBackButtonPicker(picker: HTMLIonPickerElement) {
    this.backButtonSubscription.unsubscribe();
    this.backButtonSubscription = this.platform.backButton.subscribe(async () => {
      await picker.dismiss();
    });
  }

  private setBackButtonModal(modal: HTMLIonModalElement) {
    this.backButtonSubscription.unsubscribe();
    this.backButtonSubscription = this.platform.backButton.subscribe(async () => {
      await modal.dismiss();
    });
  }
}

