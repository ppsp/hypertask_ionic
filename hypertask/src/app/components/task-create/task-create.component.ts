import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CalendarTask } from 'src/app/models/Core/calendar-task';
import { CalendarTaskService } from 'src/app/services/calendar-task.service';
import { ModalController, LoadingController, Platform, AlertController, PickerController, NavController, NavParams } from '@ionic/angular';
import { DayOfWeek } from 'src/app/models/Core/day-of-week.enum';
import { FormatDayOfWeekPipe } from 'src/app/pipes/format-dayofweek-pipe';
import { TaskFrequency } from 'src/app/models/Core/task-frequency.enum';
import DateUtils from 'src/app/shared/date-utils';
import { AlertOptions } from '@ionic/core';
import { DatePipe } from '@angular/common';
import { InvalidCalendarTaskError } from 'src/app/models/Exceptions/InvalidCalendarTaskError';
import { ILogger } from 'src/app/interfaces/i-logger';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from 'src/app/services/alert.service';
import NumberUtils from 'src/app/shared/number-utils';
import { IUserService } from 'src/app/interfaces/i-user-service';
import { Ionic4DatepickerModalComponent } from '@logisticinfotech/ionic4-datepicker';
import { DateService } from 'src/app/services/date.service';
import { UserConfig } from 'src/app/models/Core/user-config';
import { TaskGroup } from 'src/app/models/Core/task-group';
import { ResultType } from 'src/app/models/Core/result-type.enum';
import { GroupCreateComponent } from '../group-create/group-create.component';
import { EventData, EventService } from 'src/app/services/event.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-task-create',
  templateUrl: './task-create.component.html',
  styleUrls: ['./task-create.component.scss'],
})
export class TaskCreateComponent implements OnInit, OnDestroy, AfterViewInit {

  private hourChoices: string[] = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11',
                                   '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];

  public currentTask: CalendarTask;
  public selectedPositive: string = '0';
  public otherTasks: CalendarTask[]; /* Required in order to select the AbsolutePosition */
  public selectedAfterTask: CalendarTask; /* ngModel of the AbsolutePosition property */
  public selectedGroup: TaskGroup;
  public groups: TaskGroup[];

  public assignedDatePicked: string;
  public currentAssignedDateString: string;

  public showRequiredDays: boolean;
  public showAssignedDate: boolean;
  public showReccuringFrequency: boolean;
  public showSetToTomorrow: boolean = true;
  public showOnceSubType: boolean;
  public showSingleDay: boolean;
  private backButtonSubscription: Subscription;
  private recurringSelected: boolean;
  private onceSelected: boolean;
  public notificationEnabled: boolean;
  public notificationTimeValue: string;
  public preSelectedGroupId: string = "";
  public recurringValue: string = "Recurring";

  private datePickerObj: any = {};

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
    private logger: ILogger,
    private loadingController: LoadingController,
    public formatDayOfWeekPipe: FormatDayOfWeekPipe,
    private datepipe: DatePipe,
    private platform: Platform,
    private translate: TranslateService,
    private userService: IUserService,
    private alertService: AlertService,
    private alertCtrl: AlertController,
    private dateService: DateService,
    private pickerCtrl: PickerController,
    private eventService: EventService,
    private modalService: ModalService,
    public navCtrl: NavController,
    public navParams: NavParams) { 
      this.preSelectedGroupId = navParams.get("preSelectedGroupId");
      //console.log('PRESELECTED GROUPID = ' + this.preSelectedGroupId);
    }

  async ngOnInit() {
    // console.log('CREATE ON INIT START', new Date().toISOString());
    this.currentTask = new CalendarTask();
    this.currentTask.RequiredDays = this.daysOfWeek;
    this.recurringSelected = true;
    this.onceSelected = false;
    this.groups = this.calendarTaskService.allGroups.filter(p => p.Void === false);
    await this.initializeGroup();
    await this.initializeOtherTasks();
    this.assignedDatePicked = new Date().toISOString();
    this.setShownComponents();
    this.backButtonSubscription = this.platform.backButton.subscribe(async () => {
      await this.closePopup();
    });

    const todayDate = this.dateService.GetTodayWorkDate();
    const result = this.datepipe.transform(todayDate, 'yyyy-MM-dd');
    this.currentAssignedDateString = result;
    this.currentTask.AssignedDate = todayDate;

    this.selectedResultTypeCaption = this.resultTypeCaptions[0];

    // console.log('TASK CREATE GROUPS', this.groups);

    this.notificationEnabled = false;
    this.notificationTimeValue = '12:00';

    // console.log('CREATE ON INIT ENDED', new Date().toISOString());
  }

  ngOnDestroy(): void {
    this.backButtonSubscription.unsubscribe();
  }

  ngAfterViewInit(): void {
    // console.log('CREATE AFTER VIEW INIT', new Date().toISOString());
  }

  public async btnSaveClick(): Promise<void> {

    const loading = await this.loadingController.create({
      message: this.translate.instant('create-task.saving-new-task'),
    });
    await loading.present();

    if (this.recurringSelected) {
      this.currentTask.Frequency = TaskFrequency.Daily;
    } else {
      if (this.onceSelected) {
        this.currentTask.Frequency = TaskFrequency.Once;
      } else {
        this.currentTask.Frequency = TaskFrequency.UntilDone;
      }
    }

    try {
      this.currentTask.validate(this.translate);
    } catch (error) {
      if (error instanceof InvalidCalendarTaskError) {
        // console.log('error03');
        this.logger.logError(new Error('invalidcalendartaskerror'), { key: 'error', value: JSON.stringify(error)});
        alert(error.message);
        await loading.dismiss();
        return;
      }
    }

    // Validation 1
    if (this.currentTask.Frequency !== TaskFrequency.Daily) {
      this.currentTask.RequiredDays = [];
    }

    // Validation 2
    if (this.currentTask.Frequency === TaskFrequency.Daily) {
      this.currentTask.AssignedDate = null;
    }

    // Notifications
    // console.log('notification enabled', this.notificationEnabled);
    // console.log('notification id', this.currentTask.NotificationId);
    if (this.notificationEnabled === true &&
        (this.currentTask.NotificationId == null ||
        Number.isNaN(this.currentTask.NotificationId))) {
      // console.log('SETTING NOTIFICATION ID');
      this.currentTask.NotificationId = Math.max(...this.calendarTaskService.getAllTasks()
                                                        .filter(p => p.NotificationId < 1000000).map(p => p.NotificationId)) + 1;
      if (Number.isNaN(this.currentTask.NotificationId)) {
        this.currentTask.NotificationId = 1;
        if (this.calendarTaskService.getAllTasks().filter(p => p.NotificationId === 1 && p.Void === false).length > 0) {
          // 1 already exists
          this.logger.logError(new Error('NotificationId = 1 already exists'));
        }
      } else {
        this.logger.logDebug('SETTING NOTIFICATION TO ' + this.currentTask.NotificationId);
      }
    }

    // console.log('NOTIFICATIONID=', this.currentTask.NotificationId);

    this.currentTask.InsertDate = new Date();
    this.currentTask.UpdateDate = new Date();
    this.currentTask.UserId = await this.userService.getCurrentUserId();
    this.currentTask.CalendarTaskId = NumberUtils.getRandomId(); // we need it in case we void it before syncing
    this.currentTask.GroupId = this.selectedGroup.GroupId;

    try {
      const result = await this.calendarTaskService.insertCalendarTask(this.currentTask);

      await loading.dismiss();
      if (result === true) {
        await this.modalController.dismiss(true, null, ModalService.ModalIds.CreateTask);
        this.eventService.emit(new EventData(EventService.EventIds.NotificationSyncedFalse, null));
      } else {
        this.logger.logError(new Error('Unable to create new task, result is false'));
        alert(this.translate.instant('create-task.saving-error'));
      }
      return;
    } catch (error) {
      await loading.dismiss();
      this.logger.logError(new Error('Unable to create new task : ' + error.message));
      alert(this.translate.instant('create-task.saving-error'));
      return;
    }
  }

  public cbDayOfWeek(event: any, dayOfWeek: number): void {
    if (event.detail.checked) {
      this.currentTask.RequiredDays.push(dayOfWeek);
    } else {
      this.currentTask.RequiredDays = this.currentTask.RequiredDays.filter(p => p.valueOf() !== dayOfWeek);
    }
  }

  public absolutePositionChange(absolutePosition: number) {
    this.currentTask.AbsolutePosition = absolutePosition + 1;
  }

  public setToFirst(): void {
    this.currentTask.AbsolutePosition = 1;
    this.selectedAfterTask = null;
  }

  public async closePopup(): Promise<void> {
    await this.modalController.dismiss(false, null, ModalService.ModalIds.CreateTask);
  }

  public async btnAssignedDateClick() {
    const data = await this.modalService.showAssignedDateModal(Ionic4DatepickerModalComponent, this.datePickerObj, this.currentTask);

    if (data != null) {
      const selectedDate = new Date(data.data.date);

      if (!DateUtils.isValidDate(selectedDate)) { // standard cancel
        return;
      }

      this.currentAssignedDateString = this.datepipe.transform(selectedDate, 'yyyy-MM-dd');
      this.currentTask.AssignedDate = DateUtils.RemoveHours(selectedDate);
    }
  }

  public async btnSetToTomorrow() {
    this.currentTask.AssignedDate = DateUtils.AddDays(this.dateService.GetTodayWorkDate(), 1);
    this.currentAssignedDateString = this.datepipe.transform(this.currentTask.AssignedDate, 'yyyy-MM-dd');
    this.showSetToTomorrow = false;
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
              this.currentTask.NotificationId = Math.max(...this.calendarTaskService.getAllTasks().map(p => p.NotificationId)) + 1;
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

  public async recurringChanged(event: any, isOnce: any) {
    if (event != null && event.detail.value == '') {
      return;
    }

    console.log('recurringChanged isOnce', event, isOnce);
    if ((event != null && event.detail.value === 'Once') || isOnce === true) {
      console.log('recurringChanged isOnce true');
      this.showAssignedDate = true;
      this.showReccuringFrequency = false;
      this.showRequiredDays = false;
      this.showSingleDay = true;
      this.recurringSelected = false;

      // Get default group
      const defaultGroupId = this.userService.getConfig(UserConfig.DefaultNonRecurringGroupId);
      const defaultAfterTaskName = this.userService.getConfig(UserConfig.DefaultNonRecurringAfterTaskNameKey);
      await this.changeToDefaultGroup(defaultGroupId, defaultAfterTaskName);
      
      this.recurringSelected = this.selectedGroup.RecurringDefault !== false;
      this.onceSelected = this.selectedGroup.RecurringDefault === false;
    } else {
      console.log('recurring false value : ', this.recurringValue, isOnce);
      this.showAssignedDate = false;
      this.showReccuringFrequency = true;
      this.showRequiredDays = true;
      this.showSingleDay = false;
      this.recurringSelected = true;

      const defaultGroupId = this.userService.getConfig(UserConfig.DefaultRecurringGroupId);
      const defaultAfterTaskName = this.userService.getConfig(UserConfig.DefaultRecurringAfterTaskNameKey);
      await this.changeToDefaultGroup(defaultGroupId, defaultAfterTaskName);
      
      this.recurringSelected = this.selectedGroup.RecurringDefault !== false;
      this.onceSelected = this.selectedGroup.RecurringDefault === false;
    }
  }

  private async changeToDefaultGroup(defaultGroupId: any, defaultAfterTaskName: any) {

    // PRESELECTED GROUP
    if (this.preSelectedGroupId != "") {
      this.selectedGroup = this.calendarTaskService.getGroup(this.preSelectedGroupId);
      this.currentTask.GroupId = this.selectedGroup.GroupId;
    } else {
      // DEFAULT GROUP
      if (defaultGroupId != null) {
        // console.log('found a default group id');
        this.selectedGroup = this.calendarTaskService.getGroup(defaultGroupId);
        this.currentTask.GroupId = this.selectedGroup.GroupId;
      }
  
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
    }
  }

  public singleDateChanged(event: any) {
    if (event.detail.value === 'ChosenDayOnly') {
      this.onceSelected = true;
    } else {
      this.onceSelected = false;
    }
  }

  private setShownComponents() {
    console.log('setShownComponents', this.currentTask.Frequency);
    this.showRequiredDays = this.currentTask.Frequency === TaskFrequency.Daily;
    this.showAssignedDate = this.currentTask.Frequency !== TaskFrequency.Daily;
    this.showSingleDay = this.currentTask.Frequency !== TaskFrequency.Daily;;
  }

  public async selectPosition() {
    const handlerOk: (alertData: any) => void = (alertData) => {
      this.selectedAfterTask = this.otherTasks.filter(p => p.Name === alertData)[0];

      if (this.selectedAfterTask != null) {
        this.absolutePositionChange(this.selectedAfterTask.AbsolutePosition);
      } else {
        this.absolutePositionChange(0);
      }
    };

    const handlerCancel: (alertData: any) => void = (alertData) => {
      return;
    };

    const handlerSetAsDefault: (alertData: any) => void = (alertData) => {
      // console.log('SETTING AS DEFAULT', alertData);

      if (this.recurringSelected) {
        this.userService.setDefaultRecurringPositionName(alertData);
      } else {
        this.userService.setDefaultNonRecurringPositionName(alertData);
      }

      this.selectedAfterTask = this.otherTasks.filter(p => p.Name === alertData)[0];
      if (this.selectedAfterTask != null) {
        this.absolutePositionChange(this.selectedAfterTask.AbsolutePosition);
      } else {
        this.absolutePositionChange(0);
      }
    };

    const handlerSetAsFirst: (alertData: any) => void = (alertData) => {
      this.setToFirst();
    };

    const afterTaskName = this.selectedAfterTask != null ?
                            this.selectedAfterTask.Name :
                            '';

    const alertOptions: AlertOptions = this.alertService.getChangeDefaultAlertOptions(handlerOk,
                                                                                      handlerCancel,
                                                                                      handlerSetAsDefault,
                                                                                      handlerSetAsFirst,
                                                                                      this.otherTasks.map(p => p.Name),
                                                                                      afterTaskName);
    const alert = await this.alertCtrl.create(alertOptions);

    await alert.present();

    this.setBackButtonAlert(alert);
    await alert.onDidDismiss();
    this.resetBackButton();
  }

  public async selectGroup() {

    const handlerOk: (alertData: any) => void = async (alertData) => {
      this.selectedGroup = this.groups.filter(p => p.Name === alertData)[0];
      this.selectedAfterTask = null;
      this.currentTask.GroupId = this.selectedGroup.GroupId;
      await this.refreshOtherTasks();

      // console.log('SETTING', this.selectedGroup);
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
        this.currentTask.GroupId = this.selectedGroup.GroupId;
        this.selectedAfterTask = null;
        await this.refreshOtherTasks();
      }
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

  private setBackButtonPicker(picker: HTMLIonPickerElement) {
    this.backButtonSubscription.unsubscribe();
    this.backButtonSubscription = this.platform.backButton.subscribe(async () => {
      await picker.dismiss();
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

  private async initializeGroup() {
    // PRESELECTED GROUP
    if (this.preSelectedGroupId != "") {
      this.selectedGroup = this.calendarTaskService.getGroup(this.preSelectedGroupId);
      this.currentTask.GroupId = this.selectedGroup.GroupId;
      console.log('ReccuringDefault : ', this.selectedGroup.RecurringDefault);
      this.recurringValue = this.selectedGroup.RecurringDefault === false ? 'Once' : 'Recurring';
      this.currentTask.Frequency = this.selectedGroup.RecurringDefault === false ? TaskFrequency.Once : TaskFrequency.Daily;
      console.log('Sending isone value :', this.selectedGroup.RecurringDefault === false, this.selectedGroup.RecurringDefault);
      this.recurringChanged(null, this.selectedGroup.RecurringDefault === false);
    } else {
      // Set groupId to default, should only be done when init
      if (this.userService.getConfig(UserConfig.DefaultRecurringGroupId) != null) {
        // console.log('found a default group id');
        // tslint:disable-next-line:max-line-length
        this.selectedGroup = this.calendarTaskService.getGroup(this.userService.getConfig(UserConfig.DefaultRecurringGroupId));
        this.currentTask.GroupId = this.selectedGroup.GroupId;
      } else { // this should not happen but we need to handle that case
        this.logger.logError(new Error('No default group found'));
        this.selectedGroup = this.groups[0];
      }
    }

    await this.refreshOtherTasks();
  }

  private async initializeOtherTasks() {
    const defaultAfterTaskName = this.userService.getConfig(UserConfig.DefaultRecurringAfterTaskNameKey);

    // Set groupId to default, should only be done when init
    if (this.selectedGroup != null && defaultAfterTaskName != null &&
        this.otherTasks.some(p => p.Name === defaultAfterTaskName)) {
      this.selectedAfterTask = this.otherTasks.filter(p => p.Name === defaultAfterTaskName)[0];
    } else {
      // console.log('did not find a defaulaftername', this.otherTasks);
      this.selectedAfterTask = null;
    }

    if (this.otherTasks.length === 0 || this.selectedAfterTask == null) {
      this.currentTask.AbsolutePosition = 1;
    } else {
      this.currentTask.AbsolutePosition = this.selectedAfterTask.AbsolutePosition + 1;
    }
  }

  private async refreshOtherTasks() {
    this.otherTasks = this.calendarTaskService.getAllPresentTasks()
                                              .filter(p => p.CalendarTaskId !== this.currentTask.CalendarTaskId &&
                                                           p.GroupId === this.currentTask.GroupId &&
                                                           !p.Void);

    // console.log('did not find a defaultaftername');
    this.selectedAfterTask = null;
    this.currentTask.AbsolutePosition = 1;
  }
}
