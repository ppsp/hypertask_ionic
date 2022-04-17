import { Injectable } from '@angular/core';
import { TaskTimer } from '../models/Core/task-timer';
import DateUtils from '../shared/date-utils';
import { ILogger } from '../interfaces/i-logger';
import { IDataSyncLocalService } from '../interfaces/i-data-sync-local-service';
import { ILocalStorageService } from '../interfaces/i-local-storage-service';
import { AlertService } from './alert.service';
import { AlertOptions } from '@ionic/core';
import { CalendarTaskService } from './calendar-task.service';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class TimerService {

  public allTimers: TaskTimer[] = [];

  constructor(private logger: ILogger,
              private localSync: IDataSyncLocalService,
              private local: ILocalStorageService,
              private alertService: AlertService,
              private alertCtrl: AlertController,
              private calendarTaskService: CalendarTaskService) { }

  public async addTimer(timer: TaskTimer): Promise<void> {
    // this.logger.logEvent('addTimer', { key: 'timer', value: JSON.stringify(timer)});
    this.logger.logDebug('addTimer');
    // this.logger.logDebug('addTimer', JSON.stringify(timer));

    const timers = this.allTimers.filter(p => p.CalendarTaskId === timer.CalendarTaskId &&
                                              p.isDone === false &&
                                              p.isVoid === false &&
                                              DateUtils.datesAreEqual(p.TimerDate, timer.TimerDate));

    if (timers.length > 0) {
      alert('timers for same taskid already exists : ' + timers[0].CalendarTaskId);
      // alert('timers for same taskid already exists : ' + JSON.stringify(timers));
      // this.logger.logDebug('timers for same taskid already exists : ', JSON.stringify(timers));
      this.logger.logDebug('timers for same taskid already exists : ' + timers[0].CalendarTaskId);
    }

    this.allTimers.push(timer);
    await this.localSync.queueInsertTimer(timer.toDTO());
  }

  public async updateTimer(timer: TaskTimer): Promise<void> {
    // console.log('UPDATING TIMER', timer);
    const dto = timer.toDTO();
    await this.localSync.queueUpdateTimer(dto);
  }

  public async voidTimer(timer: TaskTimer): Promise<void> {
    const dto = timer.toDTO();
    dto.isVoid = true;
    await this.localSync.queueUpdateTimer(dto);

    const index = this.allTimers.findIndex(p => p.TimerId === timer.TimerId);
    this.allTimers.splice(index, 1);
  }

  /* Returns null if we can't find timer */
  public async getTimer(date: Date,
                        calendarTaskId: string): Promise<TaskTimer> {

    // console.log('GET TIMER calendarTaskId', calendarTaskId, this.allTimers, date);
    /*if (calendarTaskId === 'XpcSrbVi3b8AMEwUJ8Lq') {
      console.log('this.allTimers', this.allTimers);
      this.logger.logEvent('getTimer1', { key: 'date', value: JSON.stringify(date)});
      this.logger.logEvent('getTimer2', { key: 'TimerDate', value: JSON.stringify(this.allTimers.map(p => p.TimerDate))});
    }*/

    // console.log('[0]datesAreEqual');

    const timers = this.allTimers.filter(p => p.CalendarTaskId === calendarTaskId &&
                                              p.isDone === false &&
                                              p.isVoid === false &&
                                              DateUtils.datesAreEqual(p.TimerDate, date));

    //console.log('TIMERS : ', timers);

    if (timers.length > 0) {
      if (timers.length > 1) {
        alert('Multiple timers for same taskid');
        //this.logger.logDebug('MULTIPLE TIMERS FOR SAME TASKID', timers[9].CalendarTaskId);
        // this.logger.logDebug('MULTIPLE TIMERS FOR SAME TASKID', JSON.stringify(timers));
        // Delete extra timers but we need to find the source of this
        if (timers.length > 0) {
          for (let i = 1; i < timers.length ; i++) {
            await this.voidTimer(timers[i]);
          }
        }
        return timers[0];
      } /*else {
        console.log('ONE TIMER RETRIEVED', timers[0]);
      }*/
      return timers[0];
    } else {
      /*if (calendarTaskId === 'XpcSrbVi3b8AMEwUJ8Lq') {
        this.logger.logEvent('logger is null', { key: 'this.allTimers', value: JSON.stringify(this.allTimers)});
      }*/
      return null;
    }
  }

  public async loadTimersFromDatabase(): Promise<void> {
    const dtos = await this.local.getTimers(false);
    this.allTimers = dtos.filter(p => p.isVoid !== true).map(p => TaskTimer.fromDTO(p));

    //console.log('TIMERS FROM DATABASE', this.allTimers);

    for (const timer of this.allTimers) {
      // RUNNING TIMER
      if (timer.isPaused === false && timer.isDone === false) {
        // console.log('ACTIVATING STARTED TIMER', timer);

        timer.currentTimerSeconds = Number(DateUtils.getTimeSince(timer.StartDate)) / 1000 + timer.currentTimerSeconds;
        timer.start();

      }
    }
  }

  /* Returns null if we can't find timer */
  public anyTimerOn(): boolean {
    const result = this.allTimers.some(p => p.isPaused === false &&
                                            p.isDone === false);

    if (result === true) {
      this.logger.logDebug('TIMERS ON :', JSON.stringify(this.allTimers.filter(p => p.isPaused === false &&
                                                                                    p.isDone === false)));
    }

    return result;
  }

  /**
   * Checks if there are old timers still running and either dismiss them or ask user
   * if he wants to keep them
   */
  public async checkForOldTimer() {
    for (const timer of this.allTimers) {
      // IF TIMER IS OVER 24 HOURS AGO AUTOMATICALLY DISMISS IT
      if (timer.isKeepLongTimer !== true &&
          DateUtils.daysBetween(timer.StartDate, new Date()) > 1) {
        // console.log('Automatically dismiss old timer : ', timer);
        timer.cancel();
        this.voidTimer(timer);
        // this.eventService.emit(new EventData(EventService.EventIds.CardReset + this.currentTaskId, true));
      }

      // IF TIMER IS > 10 HOURS SHOW ALERT TO DISMISS IT
      if (timer.isKeepLongTimer !== true &&
          timer.currentTimerSeconds >= 60 * 60 * 10) {
        const handlerCancel: (alertData: any) => void = (alertData) => {
          timer.isKeepLongTimer = true;
          this.updateTimer(timer);
        };

        const handlerOk: (alertData: any) => void = (alertData) => {
          timer.cancel();
          this.voidTimer(timer);
          // this.eventService.emit(new EventData(EventService.EventIds.CardReset + this.currentTaskId, true));
        };

        if (timer.CalendarTaskId == null) {
          // console.log('TIMER IS NULL');
          this.logger.logDebug('TIMER IS NULL');
        }
        // console.log('getting task from timer');
        const task = this.calendarTaskService.getTask(timer.CalendarTaskId);
        if (task == null) { // Delete timer if task no longer exists
          timer.cancel();
          this.voidTimer(timer);
        } else {
          const alertOptions: AlertOptions = this.alertService.getTimerExpiredAlertOptions(handlerCancel,
            handlerOk,
            timer.currentTimerSeconds,
            task.Name);
          const alert = await this.alertCtrl.create(alertOptions);
          await alert.present();

          await alert.onWillDismiss();
          // console.log('DISMISSED');
        }
      }
    }
  }
}
