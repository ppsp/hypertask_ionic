import { Injectable } from '@angular/core';
import { DataSyncServerService } from './data-sync-server-service';
import ThreadUtils from '../shared/thread.utils';
import { environment } from 'src/environments/environment';
import { CalendarTaskService } from './calendar-task.service';
import { TaskHistoryService } from './task-history.service';
import { ApiHttpError } from '../models/Exceptions/ApiHttpError';
import { EventService } from './event.service';
import { ILogger } from '../interfaces/i-logger';
import { IDataSyncLocalService } from '../interfaces/i-data-sync-local-service';

@Injectable({
  providedIn: 'root'
})
export class DataSyncService2 {

  // NOTE : We should make sure the task is put again in queue if it fails ?

  private API_HTTP_ERROR_COUNT: number = 0;
  private API_HTTP_ERROR_DATE: Date;
  private ThreadTasks: ThreadTask[] = [];

  constructor(private localDataSync: IDataSyncLocalService,
              private serverDataSync: DataSyncServerService,
              //private notificationService: NotificationService, TODO CAPACITOR
              private logger: ILogger,
              private eventService: EventService) {
    this.eventService.on(EventService.EventIds.Resume, () => {
      console.log('Datasync On Resume');
      this.queueTransaction(new ServerGetLatestSyncThreadTask());
      this.queueTransaction(new ServerSyncThreadTask()); // OPTIONAL
      this.queueTransaction(new NotificationThreadTask());
    });

    this.eventService.on(EventService.EventIds.SyncRequired, () => {
      console.log('Datasync On Sync Required');
      this.queueTransaction(new LocalSyncThreadTask());
      this.queueTransaction(new ServerSyncThreadTask());
      this.queueTransaction(new NotificationThreadTask());
    });
  }

  public async checkForSyncRepeat(): Promise<void> {
    while (true) {
      console.log('checkForSyncRepeat');
      try {
        if (this.ThreadTasks.length > 0) {
          const initialName = this.ThreadTasks[0].name;
          console.log('------ PROCESSING THREAD TASK : ' + this.ThreadTasks[0].name, initialName);
          await this.ThreadTasks[0].processTransaction(this.localDataSync, this.serverDataSync, /*this.notificationService, */ this.logger);
          console.log('++++++ THREAD TASK COMPLETED : ' + this.ThreadTasks[0].name, initialName);
          this.ThreadTasks.splice(0, 1);
        } /*else {
          console.log('xxxxxx - NO TASK TO PROCESS - xxxxxx');
        }*/
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
        await ThreadUtils.sleep(1500); // todo capacitor
      }
    }
  }

  public queueTransaction(task: ThreadTask) {
    // console.log('queuing Transaction sync 2: ', task.name);
    if (this.ThreadTasks.length === 0) {
      // console.log('No tasks queued : ', task.name);
      this.ThreadTasks.push(task);
      return;
    }

    if (this.ThreadTasks.some(t => t.name === task.name)) {
      console.log('CANT QUEUE ALREADY EXISTS: ', task.name);

      /*if (task.name === 'Notification') {
        return;
      }*/

      return;
    }

    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < this.ThreadTasks.length; i++) {
      if (task.priority < this.ThreadTasks[i].priority) {
        if (this.ThreadTasks[i].isStarted) {
          this.ThreadTasks[i].cancelToken.cancelRequested = true;
        }

        // cant insert at 0
        if (i === 0 && this.ThreadTasks.length > 0) {
          // console.log('Inserting at : ', 1, task.name, this.ThreadTasks);
          this.insertAt(this.ThreadTasks, 1, task);
        } else {
          // console.log('Inserting at : ', i, task.name, this.ThreadTasks);
          this.insertAt(this.ThreadTasks, i, task);
        }

        return;
      }
    }

    for (const t of this.ThreadTasks) {
      if (task.priority < t.priority) {
        // console.log('Inserting before : ', t, this.ThreadTasks);
        this.ThreadTasks.unshift(task);
        return;
      }
    }

    // console.log('Inserting at the end: ', this.ThreadTasks);
    this.ThreadTasks.push(task);
    return;
  }

  public insertAt(array, index, ...elementsArray) {
    array.splice(index, 0, ...elementsArray);
  }
}

abstract class ThreadTask {
  public cancelToken: CancellationToken = new CancellationToken();
  public priority: number;
  public isStarted: boolean;
  public name: string;

  abstract processTransaction(localDataSync: IDataSyncLocalService,
                              serverDataSync: DataSyncServerService,
                              /*notificationService: NotificationService,*/
                              logger: ILogger): Promise<boolean>;
}

// Notifications need to be checked when :
// - Resume
// - Application start
// - Action is done
class NotificationThreadTask implements ThreadTask {
  public cancelToken: CancellationToken = new CancellationToken();
  public priority = 4;
  public isStarted: boolean;
  public name = 'Notification';

  public async processTransaction(localDataSync: IDataSyncLocalService,
                                  serverDataSync: DataSyncServerService,
                                  /*notificationService: NotificationService,*/
                                  logger: ILogger): Promise<boolean> {
    try {
      console.log('NotificationThreadTask');
      //await notificationService.refreshNotifications(); TODO Capacitor
      return true;
    } catch (error) {
      logger.logError(error);
      alert('Error processing thread task 1');
      return false;
    }
  }
}

// Need to be checked when :
// - An action is done
class LocalSyncThreadTask implements ThreadTask {
  public cancelToken: CancellationToken = new CancellationToken();
  public priority = 1;
  public isStarted: boolean;
  public name = 'LocalSync';

  public async processTransaction(localDataSync: IDataSyncLocalService,
                                  serverDataSync: DataSyncServerService,
                                  /*notificationService: NotificationService,*/
                                  logger: ILogger): Promise<boolean> {
    try {
      console.log('LOCALSYNCTHREAD', localDataSync);
      await localDataSync.processQueue();
      // console.log('LOCALSYNCTHREAD DONE');
      return true;
    } catch (error) {
      logger.logError(error);
      alert('Error processing thread task 2');
      return false;
    }
  }
}

// Need to be checked when :
// - all of the time ?
// - after local sync
// - as long as there is something to transmit
class ServerSyncThreadTask implements ThreadTask {
  public cancelToken: CancellationToken = new CancellationToken();
  public priority = 2;
  public isStarted: boolean;
  public name = 'ServerSync';

  public async processTransaction(localDataSync: IDataSyncLocalService,
                                  serverDataSync: DataSyncServerService,
                                  /*notificationService: NotificationService,*/
                                  logger: ILogger): Promise<boolean> {
    try {
      console.log('SERVERSYNCTHREAD');
      await serverDataSync.processQueue();
      console.log('SERVERSYNCTHREAD DONE');
      return true;
    } catch (error) {
      logger.logError(error);
      alert('Error processing thread task 3');
      return false;
    }
  }
}

// Need to be checked when :
// - Resume
// - Application start
class ServerGetLatestSyncThreadTask implements ThreadTask {
  public cancelToken: CancellationToken = new CancellationToken();
  public priority = 3;
  public isStarted: boolean;
  public name = 'GetLatestServer';

  public async processTransaction(localDataSync: IDataSyncLocalService,
                                  serverDataSync: DataSyncServerService,
                                  /*notificationService: NotificationService,*/
                                  logger: ILogger): Promise<boolean> {
    try {
      // console.log('LOCALSYNCTHREAD');
      // logger.logDebug('SERVERGETLATESTSYNCTHREAD');
      await serverDataSync.GetLatest(this.cancelToken);
      return true;
    } catch (error) {
      logger.logError(error);
      alert('Error processing thread task 4');
      return false;
    }
  }
}

export class CancellationToken {
  public cancelRequested: boolean = false;
}
