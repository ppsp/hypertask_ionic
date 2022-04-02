import { Component, OnInit, OnDestroy } from '@angular/core';
import { CalendarTaskService } from 'src/app/services/calendar-task.service';
import { LoadingController, Platform, PopoverController } from '@ionic/angular';
import DateUtils from 'src/app/shared/date-utils';
import { DayOfWeek } from 'src/app/models/Core/day-of-week.enum';
import { Subscription } from 'rxjs';
import { ILogger } from 'src/app/interfaces/i-logger';
import { TranslateService } from '@ngx-translate/core';
import { DateService } from 'src/app/services/date.service';
import { IUserService } from 'src/app/interfaces/i-user-service';
import { TimerService } from 'src/app/services/timer.service';
import { FireworksService } from 'src/app/services/fireworks.service';
import { EventService, EventData } from 'src/app/services/event.service';
import { CalendarTask } from 'src/app/models/Core/calendar-task';
import { Ionic4DatepickerModalComponent } from '@logisticinfotech/ionic4-datepicker';
import { TaskFrequency } from 'src/app/models/Core/task-frequency.enum';
import { ResultType } from 'src/app/models/Core/result-type.enum';
import { UserConfig } from 'src/app/models/Core/user-config';
import * as introJs from 'intro.js/intro.js';
import NumberUtils from 'src/app/shared/number-utils';
import ThreadUtils from 'src/app/shared/thread.utils';
import { DataSyncServerService } from 'src/app/services/data-sync-server-service';
import { ModalService } from 'src/app/services/modal.service';
import { UserService } from 'src/app/services/user.service';
import { DTOUser } from 'src/app/models/DTO/dto-user';
import { IApiProvider } from 'src/app/interfaces/i-api-provider';
import { CancellationToken } from 'src/app/services/data-sync-2.service';
import { WelcomeComponent } from '../welcome/welcome.component';
import { TaskSelectionComponent } from '../task-selection/task-selection.component';
import { TaskCreateComponent } from '../task-create/task-create.component';
import { TaskListPopoverComponent } from '../task-list-popover/task-list-popover.component';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
})
export class TaskListComponent implements OnInit, OnDestroy {
  public currentDateTitle: string;
  public currentWorkDay: DayOfWeek;
  public progressBarValue: number = 0;
  public progressBarText: string;
  public showBtnSkipEverything = false;
  public showSettings = false;
  public devMode: boolean = false;
  public colorString: string = 'color-yellow';

  public prioritizeValue: any;
  public currentPrioritizeVsExecute: string;

  private subscriptions: Subscription[] = [];
  private datePickerObj: any = {};

  constructor(
    public taskService: CalendarTaskService,
    private logger: ILogger,
    private loadingController: LoadingController,
    private translate: TranslateService,
    private userService: IUserService,
    private dateService: DateService,
    private platform: Platform,
    private timerService: TimerService,
    private fireworksService: FireworksService,
    private eventService: EventService,
    private popoverController: PopoverController,
    private serverDataSync: DataSyncServerService,
    private modalService: ModalService,
    private api: IApiProvider) { } // this shouldnt be here (api)

  async ngOnInit() {
    try {
      const dateStart = new Date();
      this.logger.logDebug('[ TASK-LIST WAITING FOR PLATFORM ]', new Date().toISOString());
      await this.platform.ready();
      this.logger.logDebug('[ TASK-LIST WAITING FOR USER ]', new Date().toISOString());
      const success = await this.userService.awaitUserReady();
      if (success === false) {
        // console.log('Unable to get user, redirecting to login');
        console.log('logging out2');
        await this.userService.logout();
        location.reload();
      }

      await this.timerService.loadTimersFromDatabase();

      this.logger.logDebug('[ TASK-LIST INIT STARTING ]', new Date().toISOString());

      // const dateStart = new Date();
      // console.log('ngoninit', this.auth.getUserId());
      this.dateService.currentWorkDate = this.dateService.GetWorkDate(new Date());
      this.currentDateTitle = this.getCurrentDateString();

      this.dateService.cachingEnabled = true;
      this.dateService.ResetCaching();

      // console.log('currentWorkDate', this.currentWorkDate);
      this.currentWorkDay = this.dateService.currentWorkDate.getDay();
      this.currentDateTitle = this.getCurrentDateString();
      // console.log('setShowSkipAllBtn done', Date.now() - dateStart.getTime());
      // console.log('REFRESHTASKLISTLOCAL STARTING');
      await this.refreshTaskListLocal();
      // console.log('REFRESHTASKLISTLOCAL DONE');

      await this.timerService.checkForOldTimer();

      /*if (this.taskService.allGroups.length === 0) {
        console.log('GROUPS EMPTY');
      }*/

      if (this.taskService.getAllTasks().length === 0 &&
          UserService.currentUser.IsNew === false) {
        // console.log('TASKS EMPTY');
        // console.log('ENABLE2');
        if (this.userService.getConfig(UserConfig.EnableCloudSyncKey) === true) {
          // console.log('RELOADING FROM SERVER');
          const loading = await this.loadingController.create({
            message: this.translate.instant('menu.reloading-tasks'),
            id: 'reload-server'
          });
          await loading.present();
          // console.log('XXXXXXXX STARTING REFRESH 1'); // we have to get user from api
          const apiUserDTO = await this.api.getUser(UserService.currentUserId); // this shouldnt be here IMO (api)
          const apiUser = DTOUser.ToUser(apiUserDTO);
          await this.serverDataSync.reloadAllGroupsAndTasksServer(new CancellationToken(), apiUser.LastActivityDate, apiUser.Config);
          await loading.dismiss();
        }
      }

      // Set ProgressBar + Skip all txt when ProgressBar event
      this.subscriptions.push(this.eventService.on(EventService.EventIds.ProgressBar, async () => {
        // console.log('PROGRESSBAR EVENT');
        await this.setProgressBar(false);
        this.eventService.emit(new EventData(EventService.EventIds.NotificationSyncedFalse, null));
      }));

      this.currentPrioritizeVsExecute = 'Execute';

      this.subscriptions.push(this.eventService.on(EventService.EventIds.LanguageChanged, async () => {
        this.currentDateTitle = this.getCurrentDateString();
      }));

      this.subscriptions.push(this.eventService.on(EventService.EventIds.Walkthrough, async () => {
        await this.walkthrough();
      }));

      this.eventService.on(EventService.EventIds.SyncRequired, () => {
        // console.log('[][][][][][][] -  SYNC REQUIRED (RED)  - [][][][][][][]');
        this.colorString = 'color-red';
      });

      this.eventService.on(EventService.EventIds.LocalSyncCompleted, () => {
        // console.log('[][][][][][][] -  SYNC COMPLETED (GREEN)  - [][][][][][][]');
        if (this.userService.getConfig(UserConfig.EnableCloudSyncKey) === true) {
          this.colorString = 'color-yellow';
        } else {
          this.colorString = 'color-green';
        }
      });

      this.eventService.on(EventService.EventIds.ServerSyncCompleted, () => {
        // console.log('[][][][][][][] -  SYNC COMPLETED (GREEN)  - [][][][][][][]');
        this.colorString = 'color-green';
      });

      this.subscriptions.push(this.eventService.on(EventService.EventIds.Resume, async () => {
        this.logger.logEvent('resume event');
        this.dateService.currentWorkDate = this.dateService.GetWorkDate(new Date());
        this.currentDateTitle = this.getCurrentDateString();
        this.eventService.emit(new EventData(EventService.EventIds.DateChanged, this.dateService.currentWorkDate));
        this.taskService.setGroupsVisible();
        // remove auto expand on resume
        /*for (const group of this.taskService.allGroups) {
          if (group.isVisible === true) {
            group.isExpanded = true;
          }
        }*/
        this.eventService.emit(new EventData(EventService.EventIds.ProgressBar, null));

        // CHECK IF NEED TO REFRESH TASKS
        DataSyncServerService.GetLatestRequired = true;
      }));

      this.subscriptions.push(this.platform.resume.subscribe(async () => {
        this.eventService.emit(new EventData(EventService.EventIds.Resume, null));
      }));

      // if (UserService.currentUserId === 'Hwnf3hxuFjgIai5QxvyDNdsCZFB2') {
      this.devMode = true;
      // }

      // First time setup
      if (UserService.currentUser.IsNew === true) {
        await this.modalService.showWelcomeModal(WelcomeComponent);
      }
      
      if (this.taskService.getAllTasks().length === 0) {
        await this.modalService.showTaskSelectionModal(TaskSelectionComponent);
        await this.createDemoTasks();
        await this.walkthrough();
        UserService.currentUser.IsNew = false;
        await this.userService.saveUser(UserService.currentUser);
      }

      DataSyncServerService.ApplicationLoaded = true;
      let elapsed = new Date().getTime() - dateStart.getTime();
      this.logger.logDebug('[ TASK-LIST INIT COMPLETE ]', new Date().toISOString());
      this.logger.logDebug('[[[[[[[[[[ (' + elapsed + ') ]]]]]]]]]]', new Date().toISOString());
      

      // DO A SYNC TO SEND MISSING TASKS TO SERVER
      
      this.eventService.emit(new EventData(EventService.EventIds.SyncRequired, null));

    } catch (error) {
      this.logger.logError(error);
      alert('An unexpected error occured while initializing the application, please log out and log back ' +
            'in or reinstall the application. If it does not work please contact support');
      alert(error);
      // console.log('alert hihihi');
    }
  }

  ngOnDestroy(): void {
    for (const sub of this.subscriptions) {
      sub.unsubscribe();
    }
  }

  private async createDemoTasks() {
    try {
      const defaultNonRecurringGroupId = this.userService.getConfig(UserConfig.DefaultNonRecurringGroupId);
      // console.log('NON RECURRING GROUP ID', defaultNonRecurringGroupId);
      // console.log('ALL GROUPS', JSON.stringify(this.taskService.allGroups.map(p => p.GroupId)));
      const calendarTask1 = new CalendarTask();
      calendarTask1.Name = this.translate.instant('welcome.task-binary');
      calendarTask1.Frequency = TaskFrequency.UntilDone;
      calendarTask1.ResultType = ResultType.Binary;
      calendarTask1.UserId = await this.userService.getCurrentUserId();
      calendarTask1.AbsolutePosition = 1;
      calendarTask1.InitialAbsolutePosition = 500;
      calendarTask1.AssignedDate = DateUtils.RemoveHours(new Date());
      calendarTask1.GroupId = defaultNonRecurringGroupId;
      calendarTask1.InitialGroupId = defaultNonRecurringGroupId;
      calendarTask1.InsertDate = new Date();
      calendarTask1.CalendarTaskId = NumberUtils.getRandomId(); // we need it in case we void it before syncing

      const calendarTask2 = new CalendarTask();
      calendarTask2.Name = this.translate.instant('welcome.task-decimal');
      calendarTask2.Frequency = TaskFrequency.UntilDone;
      calendarTask2.ResultType = ResultType.Decimal;
      calendarTask2.UserId = await this.userService.getCurrentUserId();
      calendarTask2.AbsolutePosition = 2;
      calendarTask2.InitialAbsolutePosition = 500;
      calendarTask2.GroupId = defaultNonRecurringGroupId;
      calendarTask2.InitialGroupId = defaultNonRecurringGroupId;
      calendarTask2.AssignedDate = DateUtils.RemoveHours(new Date());
      calendarTask2.InsertDate = new Date();
      calendarTask2.CalendarTaskId = NumberUtils.getRandomId(); // we need it in case we void it before syncing

      const calendarTask3 = new CalendarTask();
      calendarTask3.Name = this.translate.instant('welcome.task-duration');
      calendarTask3.Frequency = TaskFrequency.UntilDone;
      calendarTask3.ResultType = ResultType.Duration;
      calendarTask3.UserId = await this.userService.getCurrentUserId();
      calendarTask3.AbsolutePosition = 3;
      calendarTask3.InitialAbsolutePosition = 500;
      calendarTask3.GroupId = defaultNonRecurringGroupId;
      calendarTask3.InitialGroupId = defaultNonRecurringGroupId;
      calendarTask3.AssignedDate = DateUtils.RemoveHours(new Date());
      calendarTask3.InsertDate = new Date();
      calendarTask3.CalendarTaskId = NumberUtils.getRandomId(); // we need it in case we void it before syncing

      const calendarTask4 = new CalendarTask();
      calendarTask4.Name = this.translate.instant('welcome.task-time-of-day');
      calendarTask4.Frequency = TaskFrequency.UntilDone;
      calendarTask4.ResultType = ResultType.TimeOfDay;
      calendarTask4.UserId = await this.userService.getCurrentUserId();
      calendarTask4.AbsolutePosition = 4;
      calendarTask4.InitialAbsolutePosition = 500;
      calendarTask4.GroupId = defaultNonRecurringGroupId;
      calendarTask4.InitialGroupId = defaultNonRecurringGroupId;
      calendarTask4.AssignedDate = DateUtils.RemoveHours(new Date());
      calendarTask4.InsertDate = new Date();
      calendarTask4.CalendarTaskId = NumberUtils.getRandomId(); // we need it in case we void it before syncing

      await this.taskService.insertCalendarTasks([calendarTask1, calendarTask2, calendarTask3, calendarTask4]);

      // EXPAND ALL GROUPS
      for (const group of this.taskService.allGroups) {
        if (group.isVisible === true) {
          group.isExpanded = true;
        }
      }

      this.eventService.emit(new EventData(EventService.EventIds.ProgressBar, null));
    } catch (error) {
      // console.log('ERROR', error);
      this.logger.logError(error);
    }
  }

  private setShowSkipAllBtn() {
    this.showBtnSkipEverything = this.dateService.currentWorkDate < DateUtils.RemoveHours(new Date()) &&
                                 this.taskService.getAllTasks().some(p =>
                                  this.taskService.isShown(p,
                                                           this.dateService.currentWorkDate.getDay(),
                                                           this.dateService.currentWorkDate) &&
                                  !this.taskService.isDoneOrSkipped(p, this.dateService.currentWorkDate));
  }

  public getCurrentDateString(): string {
    const todayWorkDate = this.dateService.GetWorkDate(new Date());
    // this.logger.logEvent('todayWorkDate', { key: 'todayWorkDate', value: JSON.stringify(todayWorkDate)});

    if (DateUtils.datesAreEqual(todayWorkDate, this.dateService.currentWorkDate)) {
      return this.translate.instant('task-list.lbl-title-today');
    } else if (DateUtils.datesAreEqual(DateUtils.AddDays(todayWorkDate, -1), this.dateService.currentWorkDate)) {
      return this.translate.instant('task-list.lbl-title-yesterday');
    } else if (DateUtils.datesAreEqual(DateUtils.AddDays(todayWorkDate, 1), this.dateService.currentWorkDate)) {
      return this.translate.instant('task-list.lbl-title-tomorrow');
    } else {
      return this.dateService.currentWorkDate.toLocaleDateString();
    }
  }

  public async addTaskButtonClick(): Promise<void> {
    await this.modalService.showCreateTaskModal(TaskCreateComponent);
  }

  public loadPreviousDay(): void {
    this.loadDay(-1);
  }

  private loadDay(addDays: number) {
    this.dateService.cachingEnabled = true;
    this.dateService.currentWorkDate = DateUtils.AddDays(this.dateService.currentWorkDate, addDays);
    // console.log('*** LOAD DAY ***', this.dateService.currentWorkDate);
    this.logger.logEvent('currentWorkDate', { key: 'currentWorkDate', value: JSON.stringify(this.dateService.currentWorkDate) });
    this.currentWorkDay = this.dateService.currentWorkDate.getDay();
    this.currentDateTitle = this.getCurrentDateString();
    // this.setShowSkipAllBtn();
    this.eventService.emit(new EventData(EventService.EventIds.DateChanged, this.dateService.currentWorkDate));
    // console.log('LOAD DAY PROGRESSBAR');
    this.dateService.cachingEnabled = false;
    this.eventService.emit(new EventData(EventService.EventIds.ProgressBar, null));
    this.taskService.setGroupsVisible();
  }

  public loadNextDay(): void {
    this.loadDay(1);
  }

  public btnSettingsClick(): void {
    this.showSettings = !this.showSettings;
  }

  public prioritize(event: any) {
    // console.log('event', event.detail.value);

    const prioritize: boolean = event.detail.value === 'Prioritize' ? true : false;
    if (prioritize === true) {
      this.taskService.enableDragAndDrop = true;
      this.eventService.emit(new EventData(EventService.EventIds.ToggleDragAndDrop, true));
    } else {
      this.taskService.enableDragAndDrop = false;
      this.eventService.emit(new EventData(EventService.EventIds.ToggleDragAndDrop, false));
    }
  }

  public async btnCurrentDateClick(): Promise<void> {

    this.datePickerObj.setLabel = this.translate.instant('task-list.btn-calendar-set');
    this.datePickerObj.todayLabel = this.translate.instant('task-list.btn-calendar-today');
    this.datePickerObj.closeLabel = this.translate.instant('task-list.btn-calendar-close');
    this.datePickerObj.monthsList = this.dateService.GetMonthAbbrs();
    this.datePickerObj.weeksList = this.dateService.GetWeekAbbrs();
    if (this.translate.currentLang === 'fr') {
      this.datePickerObj.momentLocale = 'fr-CA';
    } else {
      this.datePickerObj.momentLocale = 'en-US';
    }

    const data = await this.modalService.showCurrentDateModal(Ionic4DatepickerModalComponent,
                                                              this.datePickerObj,
                                                              this.dateService.currentWorkDate);

    if (data != null && data.data != null) {
      const selectedDate = new Date(data.data.date);

      if (!DateUtils.isValidDate(selectedDate)) { // standard cancel
        return;
      }

      // console.log('SELECTED DATE', selectedDate);

      const daysBetween = DateUtils.daysBetween(this.dateService.currentWorkDate, selectedDate);

      // console.log('DAYS BETWEEN', daysBetween);

      this.loadDay(daysBetween);
    }
  }

  public toggleDragAndDrop(event: any) {
    // console.log('TOGGLE', event.detail.checked);
    this.eventService.emit(new EventData(EventService.EventIds.ToggleDragAndDrop, event.detail.checked));
  }

  private async refreshTaskListLocal(): Promise<void> {
    const loading = await this.loadingController.create({
      message: this.translate.instant('task-list.msg-reloading-tasks'),
      id: 'refreshSpinner'
    });
    loading.present();

    try {
      this.logger.logEvent('starting reloading', { key: 'currentWorkDate', value: JSON.stringify(new Date().toISOString())});
      await this.taskService.reloadAllGroupsAndTasksLocal();
    } catch (error) {
      // console.log('error');
      this.logger.logError(new Error('Unable to get tasks : ' + error.message));
      // alert(this.translate.instant('task-list.msg-reloading-tasks-error')); // TODO : Detect first time setup
      // alert('Unable to get tasks'); cant show alert because of first time setup
    } finally {
      this.logger.logEvent('finished reloading', { key: 'currentWorkDate', value: JSON.stringify(new Date().toISOString())});
      // console.log('DISMISSING');
      await loading.dismiss('refreshSpinner');
      // console.log('DISMISSED');
      this.eventService.emit(new EventData(EventService.EventIds.ProgressBar, null));
      // this.setShowSkipAllBtn();
    }
  }

  private async setProgressBar(fireworks: boolean = false) {
    // console.log('progress bar', this.taskService.allGroups);

    this.taskService.setProgressText(this.dateService.currentWorkDate);

    if (fireworks === true &&
        this.taskService.currentProgressDone === this.taskService.currentProgressTotal &&
        this.taskService.currentProgressDone > 0) {
      await this.fireworksService.GenerateFireworks();
    }

    this.setShowSkipAllBtn();
  }

  private async setToExecute() {
    this.currentPrioritizeVsExecute = 'Execute';
  }

  private async walkthrough() {

    // console.log('WALKTHROUGH');

    this.currentPrioritizeVsExecute = 'Prioritize';

    for (let i = 0; i < 300 ; i++) {
      if (document.querySelectorAll('#stepPostpone')[0] != null) {
        break;
      }

      // console.log('walkthrough sleeping');
      await ThreadUtils.sleep(100);
    }

    const introJS = introJs();
    introJS.setOptions({
      steps: [
        {
          element: document.querySelector('#addTaskBtn'),
          intro: this.translate.instant('walkthrough.msg-intro'),
        },
        {
          element: document.querySelectorAll('#stepActionButtons')[0],
          intro: this.translate.instant('walkthrough.msg-action-buttons'),
          position: 'auto',
        },
        {
          element: document.querySelectorAll('#stepCardMenu')[0],
          intro: this.translate.instant('walkthrough.msg-task-menu'),
          position: 'auto'
        },
        {
          element: document.querySelectorAll('#stepDragAndDrop')[0],
          intro: this.translate.instant('walkthrough.msg-drag-and-drop'),
          position: 'auto'
        },
        {
          element: document.querySelectorAll('#stepPrioritizeExecute')[0],
          intro: this.translate.instant('walkthrough.msg-prioritize-and-execute'),
          position: 'auto'
        },
        {
          element: document.querySelectorAll('#stepPostpone')[0],
          intro: this.translate.instant('walkthrough.msg-postpone'),
          position: 'auto'
        },
        {
          element: document.querySelectorAll('#stepSkip')[0],
          intro: this.translate.instant('walkthrough.msg-skip'),
          position: 'auto'
        },
        {
          element: document.querySelectorAll('#stepTrash')[4],
          intro: this.translate.instant('walkthrough.msg-delete'),
          position: 'auto'
        },
        {
          element: document.querySelectorAll('#stepStartTimer')[0],
          intro: this.translate.instant('walkthrough.msg-start'),
          position: 'auto',
        },
        {
          element: document.querySelectorAll('#stepEnterResult')[0],
          intro: this.translate.instant('walkthrough.msg-results'),
          position: 'auto'
        },
        {
          intro: this.translate.instant('walkthrough.msg-void'),
          position: 'auto'
        },
        {
          element: document.querySelectorAll('#stepGroupArrow')[0],
          intro: this.translate.instant('walkthrough.msg-group-title'),
          position: 'auto'
        },
        {
          element: document.querySelectorAll('#stepEditGroup')[0],
          intro: this.translate.instant('walkthrough.msg-edit-group'),
          position: 'auto'
        },
        {
          element: document.querySelectorAll('#stepChangeDate')[0],
          intro: this.translate.instant('walkthrough.msg-change-date'),
          position: 'auto'
        },
        {
          element: document.querySelectorAll('#stepSelectDate')[0],
          intro: this.translate.instant('walkthrough.msg-select-date'),
          position: 'auto'
        },
        {
          element: document.querySelectorAll('#stepMenu')[0],
          intro: this.translate.instant('walkthrough.msg-menu'),
          position: 'auto'
        },
        {
          element: document.querySelectorAll('#stepNewTask')[0],
          intro: this.translate.instant('walkthrough.msg-new-task'),
          position: 'auto'
        },
      ],
      overlayOpacity: 0.3,
      showStepNumbers: false,
    });
    const that = this;
    introJS.onbeforechange(function() {
      if (this._currentStep === 8) {
        // console.log('what is happening');
        that.setToExecute();
      }
      if (this._currentStep === 9) {

      }
    });
    introJS.start();
  }

  public async popoverMenuClick(event) {
    event.stopPropagation();
    const popover = await this.popoverController.create({
      component: TaskListPopoverComponent,
      cssClass: 'group-popover',
      event,
      translucent: false,
      animated: false,
      showBackdrop: false,
    });
    return await popover.present();
  }
 }
