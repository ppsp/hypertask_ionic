import { CalendarTask } from 'src/app/models/Core/calendar-task';
import { Subject } from 'rxjs';
import { TaskStats } from 'src/app/models/Core/task-stat';
import DateUtils from 'src/app/shared/date-utils';
import { TaskFrequency } from 'src/app/models/Core/task-frequency.enum';
import { CalendarTaskService } from 'src/app/services/calendar-task.service';
import { ILogger } from 'src/app/interfaces/i-logger';
import { StatType } from 'src/app/models/Core/custom-stat.enum';
import { TaskStatsService } from 'src/app/services/task-stats.service';
import { DateService } from 'src/app/services/date.service';
import { TimerService } from 'src/app/services/timer.service';
import { EventService, EventData } from 'src/app/services/event.service';

export class TaskCardViewModel {

  public statsLoaded: boolean;

  public showBtnStart: boolean;
  public showBtnPause: boolean;
  public showBtnResume: boolean;
  public showBtnCancelTimer: boolean;
  public showBtnEnterTime: boolean;
  public showBtnEnterDuration: boolean;
  public showBtnEnterValue: boolean;
  public showBtnDone: boolean;
  public showBtnSkip: boolean;
  public showBtnVoid: boolean;
  public showBtnDelete: boolean;
  public showTaskResult: boolean;
  public showMainTaskButtons: boolean;
  public showCheckedBox: boolean;
  public showText: boolean;
  public showBrokenHeart: boolean;
  public showBtnNote: boolean;
  public showNote: boolean;
  public showBtnStats: boolean;
  public showPostponeBtn: boolean;
  public showBtnMenu: boolean;
  public hideTimer: boolean;
  public hideStats: boolean;
  public showBtnResumeTimer: boolean;
  public isShown: boolean;
  public isBodyShown: boolean;
  public taskResult: string;
  public currentNote: string;
  public hourValues: number[];
  public minuteValues: number[];
  public enableDragAndDrop: boolean = false;

  public eventLoadStats: Subject<void> = new Subject<void>();

  public timePicked: any;
  public btnStartStopText: string;

  public taskStats: TaskStats[] = [];

  public currentTask: CalendarTask;
  public timerComponent: any;

  constructor(task: CalendarTask,
              private calendarTaskService: CalendarTaskService,
              private logger: ILogger,
              private statsService: TaskStatsService,
              private dateService: DateService,
              private timerService: TimerService,
              private eventService: EventService) {
    this.currentTask = task;

    // TODO: does not belong here
    if (this.currentTask.Histories == null) {
      this.currentTask.Histories = [];
    }

    this.reset();
  }

  public async showTimerIfExists() {
    // TODO: Optimize with Map
    const timerObject = await this.timerService.getTimer(this.dateService.currentWorkDate, this.currentTask.CalendarTaskId);

    if (timerObject == null) {
      return;
    }

    if (timerObject.CalendarTaskId != null &&
        timerObject.isDone === false &&
        timerObject.isStarted === true) {
      if (this.showTaskResult === true) {
        console.log('TRYING TO SHOW TIMER BUT IT SHOULD NOT', timerObject, this.currentTask);
        this.logger.logError(new Error('TRYING TO SHOW TIMER BUT IT SHOULD NOT'),
                             { key: 'unSentHistories', value: JSON.stringify(timerObject.CalendarTaskId)});
      } else {
        this.logger.logDebug('Showing timer ' + timerObject.CalendarTaskId);
        this.showTimer();
        if (timerObject.isPaused === true &&
            timerObject.isDone === false) {
          this.showResumeButton();
          this.showCancelTimerButton();
        } else if (timerObject.isPaused === false &&
                    timerObject.isDone === false) {
          this.showPauseButton();
          this.showCancelTimerButton();
        }
      }
    }
  }

  /**
   * This function does not show timer if exists
   */
  public reset() {
    // console.log('RESETTING ' + this.currentTask.Name);
    this.isShown = this.calendarTaskService.isShown(this.currentTask,
                                                    this.dateService.currentWorkDate.getDay(),
                                                    this.dateService.currentWorkDate);
    this.currentTask.IsShown = this.isShown;
    if (!this.isShown) {
      return;
    }

    this.enableDragAndDrop = this.calendarTaskService.enableDragAndDrop;
    // console.log('RESETTING2 ' + this.currentTask.Name, this.enableDragAndDrop);
    this.taskResult = this.calendarTaskService.getTaskResult(this.currentTask, this.dateService.currentWorkDate);

    // console.log('[AFTER GETRESULT] ', this.currentTask.Name, this.taskResult);

    this.isBodyShown = false;
    this.currentNote = this.getTaskNote();

    if (this.currentNote != null && this.currentNote.length > 0) {
      this.isBodyShown = true;
    }

    // console.log('[AFTER GETNOTE] ', this.currentTask.Name, DateUtils.getTimeSince(startDate));

    if (this.taskStats.length === 0) {
      this.loadStats(0); // need component to be initialized or else on change event doesnt work first time
    }

    // Many subsequent functions need this, so only get it once
    const taskHistoryNoVoid = this.calendarTaskService.getTaskHistoryNoVoid(this.currentTask, this.dateService.currentWorkDate);

    // console.log('[AFTER LOADSTATS] ', this.currentTask.Name, DateUtils.getTimeSince(startDate));

    this.showBtnStats = (this.currentTask.Frequency !== TaskFrequency.Once &&
                        this.currentTask.Frequency !== TaskFrequency.UntilDone);

    this.showBtnCancelTimer = false;
    this.showBtnResume = false;
    this.showBtnPause = false;
    this.showBtnDelete = false;
    this.showPostponeBtn = false;
    this.showBtnMenu = true;

    this.showCheckedBox = this.calendarTaskService.isDoneAtDate(this.currentTask, this.dateService.currentWorkDate, taskHistoryNoVoid) &&
                          this.currentTask.isBinary();

    if (!this.showCheckedBox) {
      this.showBrokenHeart = this.calendarTaskService.isSkipped(taskHistoryNoVoid);
      // console.log('[IS SKIPPED ?] ', this.currentTask.Name, this.showBrokenHeart, taskHistoryNoVoid);
    } else {
      this.showBrokenHeart = false;
    }

    this.showText = this.calendarTaskService.isDone(this.currentTask, taskHistoryNoVoid) === true &&
                    this.currentTask.isBinary() === false;
    this.showBtnVoid = this.calendarTaskService.isDoneAtDate(this.currentTask,
                                                             this.dateService.currentWorkDate,
                                                             taskHistoryNoVoid) === true ||
                        this.calendarTaskService.isSkipped(taskHistoryNoVoid) === true;
    this.showTaskResult = this.calendarTaskService.isDoneAtDate(this.currentTask,
                                                                this.dateService.currentWorkDate,
                                                                taskHistoryNoVoid) === true ||
                            this.calendarTaskService.isSkipped(taskHistoryNoVoid) === true;
    this.showMainTaskButtons = !this.showTaskResult;

    this.showBtnSkip = true;

    this.showNote = this.calendarTaskService.hasNote(this.currentTask, this.dateService.currentWorkDate);

    this.timePicked = DateUtils.getLocalMysqlTimeFloored(new Date()).substring(0, 5);

    // console.log('timepicked', this.timePicked);
    // TODO : Optimize between AFTER STATS and HERE, it takes 5-10 ms it should take 1
    // console.log('[AFTER ALL BASE RESET CHECKS] ', this.currentTask.Name, DateUtils.getTimeSince(startDate));

    // Future
    if (this.dateService.currentWorkDate > DateUtils.RemoveHours(new Date())) {
      this.showBtnDone = false;
      this.showBtnStart = false;
      this.showBtnPause = false;
      this.showBtnEnterDuration = false;
      this.showBtnEnterTime = false;
      this.showBtnEnterValue = false;
      this.showBtnSkip = false;
      this.hideTimer = true;

      /*if (this.currentTask.Name === 'Reading') {
        console.log('HIDING TIMER READING FUTURE', this.timerComponent);
      }*/
    } else { // Present and past
      this.showBtnStart = this.currentTask.isDuration();
      this.showBtnEnterTime = this.currentTask.isTime();
      this.showBtnEnterDuration = this.currentTask.isDuration();
      this.showBtnEnterValue = this.currentTask.isDecimal();
      this.showBtnDone = this.currentTask.isBinary();

      this.hideTimer = true;

      /*if (this.currentTask.Name === 'Reading') {
        console.log('HIDING TIMER READING PRESENT PAST', this.timerComponent);
      }*/

      this.hideStats = true;
      this.showBtnNote = this.showBtnVoid && (taskHistoryNoVoid.Comment == null || taskHistoryNoVoid.Comment.length === 0);
      if (this.showTaskResult &&
          this.currentTask.isDuration() &&
          this.calendarTaskService.isSkipped(taskHistoryNoVoid) === false) {
        this.showBtnResumeTimer = true;
      } else {
        this.showBtnResumeTimer = false;
      }
    }

      // console.log('[AFTER FUTURE VS PRESENT CHECK] ', this.currentTask.Name, DateUtils.getTimeSince(startDate));

    // console.log('[RESET END] ', this.currentTask.Name, new Date().toISOString());
    // console.log('[RESET END] ', this.currentTask.Name, DateUtils.getTimeSince(startDate));

    this.showTimerIfExists();

    if (this.enableDragAndDrop === true && this.hideTimer === true) {
      this.showBtnDone = false;
      this.showBtnStart = false;
      this.showBtnEnterDuration = false;
      this.showBtnEnterTime = false;
      this.showBtnEnterValue = false;
      this.showBtnDelete = true;
      if (this.currentTask.Frequency === TaskFrequency.UntilDone &&
          !this.calendarTaskService.isDone(this.currentTask, taskHistoryNoVoid)) {
        this.showPostponeBtn = true;
      }
    }
  }

  public async toggleStats(): Promise<void> {
    this.hideStats = !this.hideStats;

    if (!this.hideStats) {
      this.eventLoadStats.next();
    }
  }

  public voidResult(): void {
    this.reset();
    this.statsLoaded = false;
    this.eventService.emit(new EventData(EventService.EventIds.TimerCancel + this.currentTask.CalendarTaskId, null));
    this.eventService.emit(new EventData(EventService.EventIds.ProgressBar, null));
  }

  public showPauseButton(): void {
    this.showBtnStart = false;
    this.showBtnPause = true;
  }

  public showTimer(): void {
    // console.log('SHOWING TIMER');
    this.isBodyShown = true;
    this.hideTimer = false;
    this.showBtnEnterDuration = false;
    this.showBtnDone = true;
    this.showBtnResume = false;
    this.showBtnSkip = false;
    this.showBtnStart = false;
  }

  public showResumeButton(): void {
    this.showBtnPause = false;
    this.showBtnResume = true;
    this.showBtnStart = false;
  }

  public showCancelTimerButton(): void {
    this.showBtnCancelTimer = true;
  }

  public getTaskNote(): string {
    // console.log('Origin GetTaskNote');
    const history = this.calendarTaskService.getTaskHistoryNoVoid(this.currentTask, this.dateService.currentWorkDate);
    if (history != null && history.Comment != null && history.Comment.length > 0) {
      return history.Comment;
    } else {
      return '';
    }
  }

  public loadStats(weeksBehind: number) {

    const defaultStats = this.statsService.getTaskStats(this.currentTask.CalendarTaskId, this.dateService.currentWorkDate, weeksBehind);
    if (this.currentTask.StatType != null) {
      // console.log('SETTING STATTYPE : ', this.currentTask.StatType);
      defaultStats.StatType = this.currentTask.StatType;
    }
    if (defaultStats != null) {
      this.insertUpdateStats(defaultStats);
    }

    if (this.currentTask.StatType === StatType.TimeUp ||
      this.currentTask.StatType === StatType.TimeSleep) {
      const sleepStats = this.statsService.getSleepDurationStats(this.dateService.currentWorkDate, weeksBehind);
      if (sleepStats != null) {
        this.insertUpdateStats(sleepStats);
      }
    }
    if (this.currentTask.StatType === StatType.TimeNonWaterStart ||
      this.currentTask.StatType === StatType.TimeNonWaterStop) {
      const nonWaterStats = this.statsService.getTimeRestrictedDurationStats(this.dateService.currentWorkDate, weeksBehind);
      if (nonWaterStats != null) {
        this.insertUpdateStats(nonWaterStats);
      }
    }
    if (this.currentTask.StatType === StatType.TimeEatStart ||
      this.currentTask.StatType === StatType.TimeEatStop) {

      const eatingStats = this.statsService.getFastingDurationStats(this.dateService.currentWorkDate, weeksBehind);
      if (eatingStats != null) {
        this.insertUpdateStats(eatingStats);
      }
    }
  }

  private insertUpdateStats(stats: TaskStats) {
    const existingTaskIndex = this.taskStats.findIndex(p => p.Name === stats.Name);
    if (existingTaskIndex === -1) {
      this.taskStats.push(stats);
    } else {
      const existingTask = this.taskStats[existingTaskIndex];
      existingTask.MinusWeeksArray = stats.MinusWeeksArray;
      existingTask.StartingMinusDays = stats.StartingMinusDays;
      existingTask.TaskInsertWorkDate = stats.TaskInsertWorkDate;
      existingTask.doneDays = stats.doneDays;
      existingTask.results = stats.results;
      existingTask.skippedDays = stats.skippedDays;
    }
  }
}
