import { Component, OnInit, Input, ViewChildren, AfterViewInit, OnDestroy } from '@angular/core';
import { CalendarTask } from 'src/app/models/Core/calendar-task';
import { TaskHistory } from 'src/app/models/Core/task-history';
import { AlertController, PickerController, PopoverController, ModalController, Platform } from '@ionic/angular';
import { TaskHistoryService } from 'src/app/services/task-history.service';
import { MainPipeModule } from 'src/app/pipes/main-pipe.module';
import DateUtils from 'src/app/shared/date-utils';
import { AlertService } from 'src/app/services/alert.service';
import { AlertOptions } from '@ionic/core';
import { ILogger } from 'src/app/interfaces/i-logger';
import { TaskStatsService } from 'src/app/services/task-stats.service';
import { StatType } from 'src/app/models/Core/custom-stat.enum';
import { TaskCardViewModel } from './task-card-viewmodel';
import { TranslateService } from '@ngx-translate/core';
import { CalendarTaskService } from 'src/app/services/calendar-task.service';
import { IUserService } from 'src/app/interfaces/i-user-service';
import { UserConfig } from 'src/app/models/Core/user-config';
import { TaskCardPopoverComponent } from '../task-card-popover/task-card-popover.component';
import { DateService } from 'src/app/services/date.service';
import { EventService, EventData } from 'src/app/services/event.service';
import { TimerService } from 'src/app/services/timer.service';
import { SkipsPopoverComponent } from '../../skips-popover/skips-popover.component';
import { Ionic4DatepickerModalComponent } from '@logisticinfotech/ionic4-datepicker';
import { VibrationService } from 'src/app/services/vibration.service';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-task-card',
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.scss'],
})
export class TaskCardComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() currentTask: CalendarTask;
  @ViewChildren('htmlTimer') timerComponent: any; // This is to enable access to the child component from this file
  @ViewChildren('currentcard') currentCardComponent: any;
  @ViewChildren('picker') datePicker;

  public viewModel: TaskCardViewModel;
  public devMode: boolean = false;
  private datePickerObj: any = {};
  private subscriptions: Subscription[] = [];

  constructor(
    private alertController: AlertController,
    private taskHistoryService: TaskHistoryService,
    public mainPipe: MainPipeModule,
    private logger: ILogger,
    private alertService: AlertService,
    private taskStatsService: TaskStatsService,
    private translate: TranslateService,
    private calendarTaskService: CalendarTaskService,
    private userService: IUserService,
    private pickerCtrl: PickerController,
    private popoverController: PopoverController,
    private dateService: DateService,
    private eventService: EventService,
    private timerService: TimerService,
    private modalController: ModalController,
    private vibrationService: VibrationService,
    private platform: Platform) { }

  async ngOnInit() {
    // const startDate = new Date();
    // this.logger.logDebug('[0] TASK ' + this.currentTask.Name + ' INIT STARTED', new Date().toISOString());
    // this.changeDetector.detach();

    // this.logger.logDebug('[0.1] TASK ' + this.currentTask.Name + ' LOADING VIEW MODEL', DateUtils.getTimeSince(startDate));

    try {
      this.viewModel = new TaskCardViewModel(this.currentTask,
        this.calendarTaskService,
        this.logger,
        this.taskStatsService,
        this.dateService,
        this.timerService,
        this.eventService);
    } catch (error) {
      // console.error('ERROR LOADING VIEWMODEL', error);
      this.logger.logError(error);
      alert('Error loading viewModel');
    }

    // this.logger.logDebug('[0.2] TASK ' + this.currentTask.Name + ' View Model loaded', DateUtils.getTimeSince(startDate));

    this.subscriptions.push(this.eventService.on(EventService.EventIds.DateChanged, () => {
      this.viewModel.reset();
    }));

    this.subscriptions.push(this.eventService.on(EventService.EventIds.CardReset + this.currentTask.CalendarTaskId, () => {
      this.viewModel.reset();
    }));

    this.subscriptions.push(this.eventService.on(EventService.EventIds.TimerResume + this.currentTask.CalendarTaskId, async () => {
      await this.voidResultAndResumeTimer();
    }));

    this.subscriptions.push(this.eventService.on(EventService.EventIds.ShowStats + this.currentTask.CalendarTaskId, async () => {
      await this.btnMoreStatsClick();
    }));

    this.subscriptions.push(this.eventService.on(EventService.EventIds.HideStats + this.currentTask.CalendarTaskId, async () => {
      this.viewModel.reset();
    }));

    this.subscriptions.push(this.eventService.on(EventService.EventIds.SkipTask + this.currentTask.CalendarTaskId, async () => {
      await this.skip();
    }));

    this.subscriptions.push(this.eventService.on(EventService.EventIds.DeleteTask + this.currentTask.CalendarTaskId, async () => {
      await this.btnDeleteClick(null);
    }));

    this.subscriptions.push(this.eventService.on(EventService.EventIds.PostponeTask + this.currentTask.CalendarTaskId, async () => {
      await this.btnPostponeClick(null);
    }));

    this.subscriptions.push(this.eventService.on(EventService.EventIds.ToggleDragAndDrop, async (enable: boolean) => {
      this.viewModel.enableDragAndDrop = enable;
      this.viewModel.reset();
    }));

    // this.logger.logDebug('[0.3] TASK ' + this.currentTask.Name + ' Subscribed date change ', DateUtils.getTimeSince(startDate));

    const user = await this.userService.getCurrentUser();

    // this.logger.logDebug('[0.4] TASK ' + this.currentTask.Name + ' Got Current User ', DateUtils.getTimeSince(startDate));

    this.viewModel.hourValues = UserConfig.getHourValues(user.Config);
    this.viewModel.minuteValues = UserConfig.getMinutesValues();
    // if (user.UserId === 'NSm32K4BF6Y7NFc2kwqWeGmy6KG2') {
    this.devMode = true;
    // }

    // this.logger.logDebug('[0.5] TASK ' + this.currentTask.Name + 'Got values, Reattaching', DateUtils.getTimeSince(startDate));
    // this.changeDetector.reattach();
    // this.logger.logDebug('[0.6] TASK ' + this.currentTask.Name + ' Reattached', DateUtils.getTimeSince(startDate));


    /*const lastGroup = this.calendarTaskService.allGroups[this.calendarTaskService.allGroups.length - 1];
    if (lastGroup.Tasks.length > 0) {
      console.log('LAST TASK GROUP', this.currentTask.Name);
      const laskTask = lastGroup.Tasks[lastGroup.Tasks.length - 1];
      if (laskTask.CalendarTaskId === this.currentTask.CalendarTaskId) {
        this.logger.logDebug('LAST ITEM LOADED', DateUtils.getTimeSince(startDate));
        // alert('LAST ITEM LOADED');
      } else {
        console.log('NOT LAST TASK', this.currentTask.Name);
      }
    } else {
      console.log('NOT LAST GROUP', this.currentTask.Name, lastGroup.Tasks);
    }*/
  }

  ngOnDestroy(): void {
    for (const sub of this.subscriptions) {
      sub.unsubscribe();
    }
  }

  private async voidResultAndResumeTimer() {
    const history = this.calendarTaskService.getTaskHistoryNoVoid(this.viewModel.currentTask,
                                                                  this.dateService.currentWorkDate);
    await this.voidResult();
    const seconds = Number(history.TaskResult);
    // this.timerComponent.first.currentTimerObject.currentTimerSeconds = history.TaskResult;
    this.startTimer(seconds);
  }

  async ngAfterViewInit(): Promise<void> {
    // if (this.currentTask.Name === 'Side Hustle') {
    // console.log('ngAfterViewInit', this.currentTask.Name, new Date().toISOString());
    // this.logger.logEvent('ngAfterViewInit', this.currentTask.Name);
    // console.log('after init', new Date().toISOString());
    // }

    // console.log('YYYYYYYYYYYYYY NG AFTER VIEW INIT', this.currentTask.Name);
    this.viewModel.timerComponent = this.timerComponent;

    /*if (this.currentTask.Name === 'Reading') {
      console.log('xxxxxxxxxxx CHECK IF EXISTS IN INIT');
    }*/
    // this.viewModel.showTimerIfExists();
    // this.logger.logDebug('[2] TASK ' + this.currentTask.Name + ' AFTER VIEW INIT', new Date().toISOString());
  }

  public async btnSkipClick(event): Promise<void> {
    this.vibrationService.vibrate(5);

    this.logger.logEvent('btnSkipClick started', { key: 'date', value: JSON.stringify(new Date().toISOString())});
    if (event != null) {
      event.stopPropagation();
    }

    // Add this feature later
    /*const daysBehindModulo = 7; // this is also the threshold of how many skips in a row triggers a popup

    let skipsInARow = 0;
    let dateIterator: Date;

    // console.log('no doneworkdate lul', this.currentTask.Histories.filter(p => p.DoneWorkDate == null));

    // Need to sort histories
    this.currentTask.Histories.sort((a, b) => {
      return a.DoneWorkDate.getTime() - b.DoneWorkDate.getTime();
    });

    // Traverse array backwards to find how many skips in a row we did
    for (let i = this.currentTask.Histories.length - 1 ; i > 0 ; i--) {
      dateIterator = DateUtils.AddDays(DateUtils.Today(), - skipsInARow - 1);
      // console.log('dateIterator : ', dateIterator);

      if (this.currentTask.Histories[i].DoneWorkDate == null) {
        // console.log('DONEDATE IS NULL', this.currentTask.Histories[i]);
        continue;
      }

      if (DateUtils.datesAreEqual(this.currentTask.Histories[i].DoneWorkDate, dateIterator) &&
          this.currentTask.Histories[i].TaskSkipped === true &&
          this.currentTask.Histories[i].Void !== true) {
        skipsInARow++;
        // console.log('skipsInARow : ', skipsInARow);
      }
    }

    if (skipsInARow > 0 && skipsInARow % daysBehindModulo === 0) {
      console.log('TOO MANY SKIPS, POPOVER', skipsInARow);
      // console.log('TASK : ', this.currentTask);
      const popover = await this.popoverController.create({
        component: SkipsPopoverComponent,
        cssClass: 'group-popover',
        componentProps: {
          currentTask: this.currentTask,
          viewModel: this.viewModel,
          daysInARow: skipsInARow
        },
        event,
        translucent: false,
        animated: true,
        showBackdrop: true,
      });
      return await popover.present();
    } else {
      console.log('Not too many skips, no popover', skipsInARow);
    }*/

    await this.skip();
  }

  public async skip(): Promise<void> {
    // this.logger.logEvent('skip started', { key: 'date', value: JSON.stringify(new Date().toISOString())});
    const calendarTaskHistory: TaskHistory = await this.createNewHistory(null, false, true);
    await this.saveTaskHistory(calendarTaskHistory);
    this.viewModel.showTaskResult = true;
    this.viewModel.showMainTaskButtons = false;
    // this.logger.logEvent('skip ended', { key: 'date', value: JSON.stringify(new Date().toISOString())});
  }

  public async btnEnterTimeClick(): Promise<void> {
    event.stopPropagation();
    await this.getTimeValueFromPicker();
  }

  public btnStartClick(event): void {
    this.vibrationService.vibrate(5);
    event.stopPropagation();
    this.startTimer(0);
  }

  public btnPauseClick(event): void {
    this.vibrationService.vibrate(5);
    event.stopPropagation();
    this.pauseTimer();
  }

  public btnUnpauseClick(event): void {
    this.vibrationService.vibrate(5);
    event.stopPropagation();
    this.UnpauseTimer();
  }

  public async btnDoneClick(event): Promise<void> {
    this.vibrationService.vibrate(5);
    this.logger.logEvent('btnDoneClick started', { key: 'date', value: JSON.stringify(new Date().toISOString())});
    event.stopPropagation();
    this.eventService.emit(new EventData(EventService.EventIds.TimerComplete + this.currentTask.CalendarTaskId, null));
    if (this.viewModel.currentTask.isBinary()) {
      await this.saveDoneTaskHistory();
    } else if (this.viewModel.currentTask.isDuration()) {
      await this.saveDurationTaskHistory();
    }
    this.logger.logEvent('btnDoneClick ended', { key: 'date', value: JSON.stringify(new Date().toISOString())});
  }

  public async btnEnterValueClick(event: any): Promise<void> {
    event.stopPropagation();
    await this.getDecimalValueFromAlert();
  }

  public async btnEnterDurationClick(event: any): Promise<void> {
    event.stopPropagation();
    await this.getDurationValueFromAlert(0, 0, 0);
  }

  public async btnMoreStatsClick() {
    // console.log('showstats', this.currentTask.Name);
    if (!this.viewModel.statsLoaded)  {
      // console.log('loading stats');
      this.viewModel.loadStats(52);
      // console.log('stats loaded');
      this.viewModel.statsLoaded = true;
    }

    // console.log('click1');
    this.viewModel.isBodyShown = true;
    await this.viewModel.toggleStats();
    // console.log('click2');
  }

  public async btnResumeTimerClick(event): Promise<void> {
    event.stopPropagation();
    const history = this.calendarTaskService.getTaskHistoryNoVoid(this.viewModel.currentTask,
                                                                  this.dateService.currentWorkDate);
    await this.voidResult();
    const seconds = Number(history.TaskResult);
    // this.timerComponent.first.currentTimerObject.currentTimerSeconds = history.TaskResult;
    this.startTimer(seconds);
  }

  public async btnCancelTimerClick(event: any): Promise<void> {
    if (event != null) {
      event.stopPropagation();
    }
    const handler: (alertData: any) => void = (alertData) => {
      this.cancelTimer();
    };

    const alertOptions: AlertOptions = this.alertService.getCancelTimerAlertOptions(handler);
    const alert = await this.alertController.create(alertOptions);

    await alert.present();

    const subscription = this.platform.backButton.subscribe(async () => {
      await alert.dismiss();
    });

    await alert.onDidDismiss();
    subscription.unsubscribe();
  }

  // TODO : Extract this ? it's duplicated
  public async btnPostponeClick(event: any) {
    if (event != null) {
      event.stopPropagation();
    }

    const datePickerModal = await this.modalController.create({
      component: Ionic4DatepickerModalComponent,
      cssClass: 'li-ionic4-datePicker',
      componentProps: {
         objConfig: this.datePickerObj,
         selectedDate: DateUtils.AddDays(this.dateService.currentWorkDate, 1)
      }
    });
    await datePickerModal.present();

    const subscription = this.platform.backButton.subscribe(async () => {
      await datePickerModal.dismiss();
    });

    const data = await datePickerModal.onDidDismiss();

    subscription.unsubscribe();

    const selectedDate = new Date(data.data.date);

    if (!DateUtils.isValidDate(selectedDate)) { // standard cancel
      return;
    }

    await this.postponeTask(selectedDate);

    this.eventService.emit(new EventData(EventService.EventIds.ProgressBar, null));
  }

  // This is accessed by group-card
  public async postponeTask(selectedDate: Date) {
    this.currentTask.SkipUntil = selectedDate;
    const result = await this.calendarTaskService.updateCalendarTask(this.currentTask);
    if (result) {
      this.viewModel.reset();
    } else {
      this.logger.logError(new Error('Unable to save skip until'));
      alert(this.translate.instant('btnPostponeClick-card.error-saving-skip-until'));
    }
  }

  // TODO : Extract this ? it's duplicated
  public async btnDeleteClick(event: any) {
    if (event != null) {
      event.stopPropagation();
    }

    const handler: (alertData: any) => void = (alertData) => {
      this.deleteTask();
    };

    const alertOptions: AlertOptions = this.alertService.getDeleteTaskAlertOptions(handler);
    const alert = await this.alertController.create(alertOptions);
    await alert.present();

    const subscription = this.platform.backButton.subscribe(async () => {
      await alert.dismiss();
    });

    await alert.onDidDismiss();

    subscription.unsubscribe();
  }

  private async deleteTask(): Promise<void> {
    /*const loading = await this.loadingController.create({
      message: this.translate.instant('edit-task.msg-deleting-task'),
    });
    loading.present();*/
    // console.log('deleting started', new Date().toISOString());
    this.currentTask.Void = true;
    this.currentTask.UserId = await this.userService.getCurrentUserId();
    const result = await this.calendarTaskService.updateCalendarTask(this.currentTask);
    try {
      // loading.dismiss();
      if (result === true) {
        this.eventService.emit(new EventData(EventService.EventIds.CardReset + this.currentTask.CalendarTaskId, true));
        this.eventService.emit(new EventData(EventService.EventIds.ProgressBar, true));
        this.eventService.emit(new EventData(EventService.EventIds.NotificationSyncedFalse, null));
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

  public async onCardClick(event: any): Promise<void> {
    const dateStart = new Date();
    this.logger.logDebug('CARD CLICK', dateStart.toISOString());
    const popover = await this.popoverController.create({
      component: TaskCardPopoverComponent,
      cssClass: 'group-popover',
      componentProps: {
        currentTask: this.currentTask,
        viewModel: this.viewModel,
      },
      event,
      translucent: false,
      animated: false,
      showBackdrop: false,
    });
    // this.logger.logDebug('CARD CLICK POPOVER CREATED ', DateUtils.getTimeSince(dateStart));
    await popover.present();
    // this.logger.logDebug('CARD CLICK POPOVER PRESENTED ', DateUtils.getTimeSince(dateStart));
  }

  public async timeEntered(): Promise<void> {
    // console.log('EVENT TIMEENTERED', this.viewModel.timePicked);
    // console.log('EVENT TIMEENTERED2', event);
    if (this.viewModel.timePicked == null) {
      return;
    }

    // this.isSelected = false; // This probably does nothing, to be tested

    if (this.currentTask.StatType !== StatType.Regular) { // TODO : Make it optionnal
      const isBetweenAllowedHours = this.getIsBetweenAllowedHours();

      if (!isBetweenAllowedHours) {
        this.validateTimeEntered();
      } else {
        await this.saveTimeEntered();
      }
    } else {
      await this.saveTimeEntered();
    }
  }

  private getIsBetweenAllowedHours() {
    let resultHours = Number(this.viewModel.timePicked.substring(0, 2));
    const maximumEarlySleepHours = 12;
    const maximumPreviousDayHour = 12;
    let endOfDayHour = Number(this.userService.getConfig(UserConfig.EndOfDayTimeKey).substring(0, 2));
    if (endOfDayHour < maximumPreviousDayHour) {
      endOfDayHour = 24 + endOfDayHour;
    }
    if (resultHours < maximumPreviousDayHour) {
      resultHours = resultHours + 24;
    }

    if (this.currentTask.StatType === StatType.TimeEatStop ||
        this.currentTask.StatType === StatType.TimeNonWaterStop ||
        this.currentTask.StatType === StatType.TimeSleep) {
      const min = endOfDayHour - maximumEarlySleepHours;
      const max = endOfDayHour;
      const isBetweenAllowedHours = min <= resultHours && resultHours <= max;
      return isBetweenAllowedHours;
    } else {
      const min = endOfDayHour;
      const max = endOfDayHour + maximumEarlySleepHours;
      const isBetweenAllowedHours = min <= resultHours && resultHours <= max;
      return isBetweenAllowedHours;
    }
  }

  private validateTimeEntered() {
    const handlerYes: (alertData: any) => Promise<boolean> = async (alertData2) => {
      this.logger.logEvent('time started', { key: 'date', value: JSON.stringify(new Date().toISOString()) });
      await this.saveTimeEntered();
      this.logger.logEvent('time ended', { key: 'date', value: JSON.stringify(new Date().toISOString()) });
      return true;
    };
    const handlerNo: (alertData: any) => boolean = (alertData2) => {
      this.viewModel.timePicked = null;
      return false;
    };
    const alertOptions2: AlertOptions = this.alertService.getConfirmationAlertOptions(
      this.translate.instant('task-card.msg-confirmation') + ' ' + this.viewModel.timePicked,
      handlerYes,
      handlerNo);
    this.alertController.create(alertOptions2).then(alert2 => {
      alert2.present();
    });
  }

  private async saveTimeEntered() {
    const endOfDayHour = Number((await this.userService.getConfig(UserConfig.EndOfDayTimeKey).substring(0, 2)));
    const hourEntered = Number(this.viewModel.timePicked.substring(0, 2));

    // let resultString = this.currentWorkDate.toISOString().substring(0, 10) + ' ' + this.viewModel.timePicked.substring(11, 16) + ':00';
    let resultString = this.dateService.currentWorkDate.toISOString().substring(0, 10) + ' ' + this.viewModel.timePicked + ':00';

    if (hourEntered <= endOfDayHour && endOfDayHour < 12) {
      resultString = DateUtils.AddDays(this.dateService.currentWorkDate, 1)
                              .toISOString().substring(0, 10) + ' ' + this.viewModel.timePicked + ':00';
    }

    // console.log('resultString', resultString);

    const resultDate = new Date(resultString);

    // console.log('resultDate', resultDate);

    const calendarTaskHistory: TaskHistory = await this.createNewHistory(resultDate, true, false);

    // console.log('SAVE TIME ENTERED 1 ', calendarTaskHistory);
    await this.saveTaskHistory(calendarTaskHistory);
    // this.viewModel.reset();
  }

  public timerIsStarted(): boolean {
    return this.timerComponent.first.currentTimerObject.isDone === true;
  }

  private async createNewHistory(taskResult: any,
                                 taskCompleted: boolean,
                                 taskSkipped: boolean): Promise<TaskHistory> {
    const calendarTaskHistory: TaskHistory = await TaskHistory.createNew(taskResult,
                                                                         taskCompleted,
                                                                         taskSkipped,
                                                                         new Date(),
                                                                         this.dateService.currentWorkDate,
                                                                         this.viewModel.currentTask.CalendarTaskId,
                                                                         UserService.currentUserId);

    return calendarTaskHistory;
  }

  private async saveTaskHistory(calendarTaskHistory: TaskHistory): Promise<void> {
    // console.log('SAVING TASK HISTORY', calendarTaskHistory, this.viewModel.currentTask);
    /*const loading = await this.loadingController.create({
      message: this.translate.instant('task-card.loading-update-calendartask'),
    });*/
    try {
      /*if (LocalStorageService.currentlyUsed === true) {
        loading.present();
      }*/

      const success = await this.taskHistoryService.insertTaskHistory(calendarTaskHistory);
      if (success === true) {
        // console.log('SUCCESS, here are the histories ', this.viewModel.currentTask.Histories);
        // this.viewModel.currentTask.Histories.push(calendarTaskHistory);
        // console.log('added again to task', this.viewModel.currentTask.Histories);
        // console.log(' SAVE SUCCESSFULT, EMITTING');
        this.viewModel.reset();
        this.viewModel.statsLoaded = false;
        this.eventService.emit(new EventData(EventService.EventIds.ProgressBar, null));
        return;
      } else {
        this.logger.logError(new Error('Unable to save taskHistory, historyId is null'));
        alert(this.translate.instant('task-card.msg-saving-error'));
        return;
      }
    } catch (error) {
      // console.log('Unable to save taskHistory : ', error);
      this.logger.logError(new Error('Unable to save taskHistory : ' + error.message));
      alert('Unable to save task history');
      return;
    } finally {
      // await loading.dismiss();
    }
  }

  private async voidCurrentTaskHistory(): Promise<void> {
    const calendarTaskHistory = this.calendarTaskService.getTaskHistoryNoVoid(this.viewModel.currentTask,
                                                                              this.dateService.currentWorkDate);
    calendarTaskHistory.Void = true;
    const success = await this.taskHistoryService.updateTaskHistory(calendarTaskHistory);
    if (success) { // TODO: Test error
      if (success === true) {
        this.viewModel.reset();
        this.eventService.emit(new EventData(EventService.EventIds.ProgressBar, null));
      } else {
        this.logger.logError(new Error('Unable to void TaskHistory, result is false'));
        alert(this.translate.instant('task-card.msg-saving-error'));
      }
    } else {
      this.logger.logError(new Error('Unable to void TaskHistory : '));
    }
  }

  private async saveDoneTaskHistory(): Promise<void> {
    // console.log('saveDoneTaskHistory started');
    // this.isSelected = false;
    const calendarTaskHistory: TaskHistory = await this.createNewHistory(true, true, false);
    // console.log('Saving task history :', calendarTaskHistory);
    await this.saveTaskHistory(calendarTaskHistory);
    // console.log('saveDoneTaskHistory ended');
    return;
  }

  private async saveDurationTaskHistory(): Promise<void> {
    // this.isSelected = false;
    let seconds = 0;
    if (this.timerComponent.first != null) {
      seconds = Math.round(this.timerComponent.first.currentTimerObject.currentTimerSeconds);
      // console.log('CURRENT TIMER SECONDS SAVED', seconds);
    }
    const calendarTaskHistory: TaskHistory = await this.createNewHistory(seconds, true, false);
    await this.saveTaskHistory(calendarTaskHistory);
    return;
  }

  private async getDecimalValueFromAlert(): Promise<void> {
    const handler: (alertData: any) => void = async (alertData) => {
      // if string is empty don't save
      if (String(alertData.Value).length === 0) {
        return;
      }

      await this.saveDecimalValue(alertData);
      this.logger.logEvent('decimal ended', { key: 'date', value: JSON.stringify(new Date().toISOString())});
    };

    const alertOptions: AlertOptions = this.alertService.getDecimalAlertOptions(handler);
    const alert = await this.alertController.create(alertOptions);

    await alert.present();

    const firstInput: any = document.querySelector('ion-alert input');
    firstInput.focus();

    const subscription = this.platform.backButton.subscribe(async () => {
      await alert.dismiss();
    });
    await alert.onDidDismiss();
    subscription.unsubscribe();
  }

  private async getDurationValueFromAlert(hours: number,
                                          minutes: number,
                                          seconds: number): Promise<void> {
    const handler: (alertData: any) => void = async (alertData) => {
      const resultHours = Number(alertData.Hours);
      const resultMinutes = Number(alertData.Minutes);
      const resultSeconds = Number(alertData.Seconds);
      if (resultHours < 0 || resultHours > 24 ||
          resultMinutes < 0 || resultMinutes > 60 ||
          resultSeconds < 0 || resultSeconds > 60) {
        this.logger.logEvent('invalid times', { key: 'resultHours', value: JSON.stringify(resultHours)});
        return;
      }

      this.logger.logEvent('duration started', { key: 'date', value: JSON.stringify(new Date().toISOString())});
      await this.saveDuration(resultMinutes, resultHours, resultSeconds);
      this.logger.logEvent('duration ended', { key: 'date', value: JSON.stringify(new Date().toISOString())});
    };

    const alertOptions: AlertOptions = this.alertService.getDurationAlertOptions(handler,
                                                                                 hours,
                                                                                 minutes,
                                                                                 seconds);

    const alert = await this.alertController.create(alertOptions);
    await alert.present();

    const subscription = this.platform.backButton.subscribe(async () => {
      await alert.dismiss();
    });
    await alert.onDidDismiss();
    subscription.unsubscribe();
  }

  private async getTimeValueFromPicker() {

    const picker = await this.pickerCtrl.create({
      columns: this.getColumns(),
      cssClass: 'time-picker',
      animated: false,
      backdropDismiss: false,
      buttons: [
        {
          text: this.translate.instant('alert.lbl-cancel'),
          role: 'cancel'
        },
        {
          text: this.translate.instant('alert.lbl-ok'),
          handler: (value) => {
            // console.log('HOUR', value.Hours.value);
            // console.log('MINUTES', value.Minutes.value);

            const hourString = Number(value.Hours.value) > 9 ?
                                 value.Hours.value :
                                 '0' + value.Hours.value;

            const minutesString = Number(value.Minutes.value) > 9 ?
                                 value.Minutes.value :
                                 '0' + value.Minutes.value;

            this.viewModel.timePicked = hourString + ':' + minutesString;
            this.timeEntered();
          }
        }
      ]
    });

    await picker.present();

    const subscription = this.platform.backButton.subscribe(async () => {
      await picker.dismiss();
    });
    await picker.onDidDismiss();
    subscription.unsubscribe();
  }

  private getColumnOptions1() {
    const options = [];
    for (const hourValue of this.viewModel.hourValues) {
      options.push({
        text: hourValue,
        value: Number(hourValue)
      });
    }

    return options;
  }

  private getColumnOptions2() {
    const options = [];
    for (const minuteValue of this.viewModel.minuteValues) {
      options.push({
        text: minuteValue,
        value: Number(minuteValue)
      });
    }

    return options;
  }

  private getColumns() {

    const currentSelection = DateUtils.getLocalMysqlTimeFloored(new Date()).substring(0, 5);
    const currentHour = Number(currentSelection.substring(0, 2));
    const currentMinutes = Number(currentSelection.substring(3, 3 + 2));
    const HourIndex = this.viewModel.hourValues.findIndex(p => p === currentHour);
    const MinuteIndex = this.viewModel.minuteValues.findIndex(p => p === currentMinutes);

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

  private startTimer(initialSeconds: number) {
    // console.log('starting timer');
    this.viewModel.showPauseButton();
    this.viewModel.showCancelTimerButton();
    this.showTimer();
    this.eventService.emit(new EventData(EventService.EventIds.TimerStart + this.currentTask.CalendarTaskId, initialSeconds));
    this.eventService.emit(new EventData(EventService.EventIds.NotificationSyncedFalse, null));
  }

  private UnpauseTimer() {
    // this.viewModel.voidResult();
    // console.log('<<<<<<<<< RESUME TIMER', this.currentTask.Name);
    this.eventService.emit(new EventData(EventService.EventIds.TimerUnpause + this.currentTask.CalendarTaskId, null));
    this.viewModel.showTimer();
    this.viewModel.showPauseButton();
    this.viewModel.showCancelTimerButton();
  }

  private pauseTimer() {
    this.eventService.emit(new EventData(EventService.EventIds.TimerPause + this.currentTask.CalendarTaskId, null));
    this.viewModel.showResumeButton();
  }

  private cancelTimer() {
    this.eventService.emit(new EventData(EventService.EventIds.TimerCancel + this.currentTask.CalendarTaskId, null));
    this.viewModel.reset();
  }

  private showTimer() {
    this.viewModel.showTimer();
  }

  private async voidResult(): Promise<void> {
    // this.isSelected = false;
    await this.voidCurrentTaskHistory();
    return;
  }

  private async saveNote(alertData: any) {
    // Disable data over 1000 characters
    if (alertData.Value.length > 2000) {
      alertData.Value = alertData.Value.substring(0, 2000);
    }

    const history: TaskHistory = this.calendarTaskService.getTaskHistoryNoVoid(this.viewModel.currentTask,
                                                                               this.dateService.currentWorkDate);
    // console.log('saveNote', history);
    history.Comment = alertData.Value;
    await this.taskHistoryService.updateTaskHistory(history);
    this.viewModel.showNote = true;
  }

  private async saveDuration(minutes: number, hours: number, seconds: number): Promise<void> {
    // this.isSelected = false;
    const durationSeconds = minutes * 60 + hours * 60 * 60 + seconds;
    const calendarTaskHistory: TaskHistory = await this.createNewHistory(durationSeconds, true, false);
    await this.saveTaskHistory(calendarTaskHistory);
    return;
  }

  private async saveDecimalValue(alertData: any): Promise<void> {
    // this.isSelected = false;
    const calendarTaskHistory: TaskHistory = await this.createNewHistory(alertData.Value, true, false);
    await this.saveTaskHistory(calendarTaskHistory);
    return;
  }
}
