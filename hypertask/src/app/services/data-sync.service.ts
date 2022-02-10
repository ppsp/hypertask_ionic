import { Injectable } from '@angular/core';
import { DataSyncServerService } from './data-sync-server-service';
import ThreadUtils from '../shared/thread.utils';
import { environment } from 'src/environments/environment';
import { IDataSyncLocalService } from '../interfaces/i-data-sync-local-service';
//import { NotificationService } from './notification.service';
import { ILogger } from '../interfaces/i-logger';
import DateUtils from '../shared/date-utils';
import { CalendarTaskService } from './calendar-task.service';
import { TaskHistoryService } from './task-history.service';
import { TaskHistory } from '../models/Core/task-history';
import { UserService } from './user.service';
import { IUserService } from '../interfaces/i-user-service';
import { UserConfig } from '../models/Core/user-config';
import { ApiHttpError } from '../models/Exceptions/ApiHttpError';
import { CancellationToken } from './data-sync-2.service';

@Injectable({
  providedIn: 'root'
})
export class DataSyncService {

  // private RETRY_SECONDS: number = environment.resyncSeconds;
  private API_HTTP_ERROR_COUNT: number = 0;
  private API_HTTP_ERROR_DATE: Date;

  constructor(private localDataSync: IDataSyncLocalService,
              private serverDataSync: DataSyncServerService,
              //private notificationService: NotificationService,
              private logger: ILogger,
              private calendarTaskService: CalendarTaskService,
              private historyService: TaskHistoryService,
              private userService: IUserService) { }

  public async checkForSyncRepeat(): Promise<void> {
    while (true) {
      try {
        // console.log('CHECKFORSINC1');
        await this.localDataSync.processQueue();

        if (this.canProcessServerRequest()) {
          if (await this.serverDataSync.processQueue() === true) {
            // console.log('processqueue successful');
            this.API_HTTP_ERROR_COUNT = 0;
          }
        }

        // console.log('CHECKFORSINC2');
        await this.localDataSync.processQueue();

        if (this.canProcessServerRequest()) {
          if (await this.serverDataSync.GetLatest(new CancellationToken()) === true) {
            // console.log('get latest successful');
            this.API_HTTP_ERROR_COUNT = 0;
          }
        }

        // console.log('CHECKFORSINC3');

        await this.localDataSync.processQueue();
        //await this.notificationService.refreshNotifications(); // TODO CAPACITOR
        // await this.processAutoSkip();
      } catch (error) {

        // HANDLE API ERRORS
        if (error instanceof ApiHttpError) {
          // console.log('INSTANCE OF API ERROR');
          this.API_HTTP_ERROR_COUNT ++;
          this.API_HTTP_ERROR_DATE = new Date();
        }

        this.logger.logDebug('Error checking for sync repeat');
        this.logger.logError(error);
      } finally {
        await ThreadUtils.sleep(1000);
      }
    }
  }

  private canProcessServerRequest(): boolean {
    const minimumTimeWait = this.getMinimumTimeWait();
    if (this.API_HTTP_ERROR_COUNT > 0) {
      const timeSinceLastError = DateUtils.getMillisecondsSince(this.API_HTTP_ERROR_DATE);
      if (timeSinceLastError > minimumTimeWait) {
        return true;
      } else {
        // console.log('CANNOT PROCESS SERVER REQUEST, NEED TO WAIT', minimumTimeWait);
        return false;
      }
    } else {
      // console.log('No Error');
      return true;
    }
  }

  private getMinimumTimeWait(): number {
    const maxMinutesWait = 1;
    const maxTimeWait = 1000 * 60 * maxMinutesWait;
    const timeWait = Math.pow(2, this.API_HTTP_ERROR_COUNT) * 1000;
    // console.log('timewait = ', timeWait);
    return Math.min(maxTimeWait, timeWait);
  }

  // Wait for feature to be requested
  public async processAutoSkip() {
    if (this.userService.getConfig(UserConfig.AutoSkipAfter2DaysId) === true) {
      // HAS TO KNOW IF ITS DONE ALREADY OR NOT
      // console.log('skipping config is true');
      const lastUpdateDate = new Date(this.userService.getConfig(UserConfig.AutoSkipAfter2DaysLastSkipDateId));
      // console.log('Last Skip Date = ', lastUpdateDate);
      const twoDaysAgo = DateUtils.AddDays(DateUtils.Today(), -2);

      if (lastUpdateDate == null || DateUtils.datesAreEqual(lastUpdateDate, DateUtils.Today()) === false) {
        // TODO : Not going to work if person doesnt use the app
        // TODO : SHOW SKIP
        // console.log('starting to process skip 2 days ago');
        for (const group of this.calendarTaskService.allGroups) {
          for (const task of group.Tasks) {
            if (this.calendarTaskService.isShown(task, twoDaysAgo.getDay(), twoDaysAgo) &&
                this.calendarTaskService.isDoneOrSkipped(task, twoDaysAgo) === false) {
              // console.log('Skipping', task.Name);
              const calendarTaskHistory: TaskHistory = await TaskHistory.createNew(null,
                                                                                  false,
                                                                                  true,
                                                                                  new Date(),
                                                                                  twoDaysAgo,
                                                                                  task.CalendarTaskId,
                                                                                  UserService.currentUserId);
              // Send event to refresh ui ?
              await this.historyService.insertTaskHistory(calendarTaskHistory);
            }
          }
        }

        // console.log('finished processing skip 2 days ago');
        this.userService.setConfig(UserConfig.AutoSkipAfter2DaysLastSkipDateId, new Date());
      }
    }
  }
}
