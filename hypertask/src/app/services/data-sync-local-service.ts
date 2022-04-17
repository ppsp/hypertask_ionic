import { Injectable } from '@angular/core';
import { DTOCalendarTask } from '../models/DTO/dto-calendar-task';
import { DTOTaskHistory } from '../models/DTO/dto-task-history';
import { IDataSyncLocalService } from '../interfaces/i-data-sync-local-service';
import { ILocalStorageService } from '../interfaces/i-local-storage-service';
import { DTOTaskTimer } from '../models/DTO/dto-timer';
import { DTOTaskGroup } from '../models/DTO/dto-task-group';
import { ILogger } from '../interfaces/i-logger';
import { EventData, EventService } from './event.service';

@Injectable({
  providedIn: 'root'
})
export class DataSyncLocalService implements IDataSyncLocalService {

  private transactionQueue: Transaction[] = [];

  constructor(private localStorage: ILocalStorageService,
              private logger: ILogger,
              private eventService: EventService) { }

  public allDataIsSynced(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  public async getUnsynchronized(): Promise<string[]> {
    const result: string[] = [];

    for (const transaction of this.transactionQueue) {
      result.push(JSON.stringify(transaction.transactionObject));
    }

    return result;
  }

  public async processQueue(): Promise<void> {
    console.log('PROCESSING QUEUE');
    while (this.transactionQueue.length > 0) {
      const transaction = this.transactionQueue.shift();

      const success = await transaction.processTransaction(this.localStorage, this.logger);
      if (!success) {
        this.logger.logError(new Error('Failed to process transaction'),
                             { key: 'transaction', value: JSON.stringify(transaction)});
      }
    }

    console.log('QUEUE PROCESSED');
    this.eventService.emit(new EventData(EventService.EventIds.LocalSyncCompleted, null));

    return;
  }

  public async queueInsertCalendarTask(task: DTOCalendarTask): Promise<any> {
    if (task == null) {
      return;
    }

    const transaction = new TaskTransaction();
    transaction.transactionType = TransactionType.Insert;
    transaction.transactionObject = task;
    this.transactionQueue.push(transaction);
    return;
  }

  public async queueUpdateCalendarTask(task: DTOCalendarTask, synced: boolean = false): Promise<any> {
    if (task == null) {
      return;
    }

    task.Synced = synced;

    const transaction = new TaskTransaction();
    transaction.transactionType = TransactionType.Update;
    transaction.transactionObject = task;

    this.transactionQueue.push(transaction);
    return;
  }

  public async queueUpdateCalendarTasks(tasks: DTOCalendarTask[], synced: boolean = false): Promise<any> {
    if (tasks == null || tasks.length === 0) {
      return;
    }

    tasks.forEach(p => p.Synced = synced);

    const transaction = new TasksTransaction();
    transaction.transactionType = TransactionType.Update;
    transaction.transactionObject = tasks;

    this.transactionQueue.push(transaction);

    return;
  }

  public async queueInsertCalendarTasks(tasks: DTOCalendarTask[]): Promise<any> {
    if (tasks == null || tasks.length === 0) {
      return;
    }

    const transaction = new TasksTransaction();
    transaction.transactionType = TransactionType.Insert;
    transaction.transactionObject = tasks;
    this.transactionQueue.push(transaction);
    return;
  }

  public async queueInsertTaskHistory(history: DTOTaskHistory): Promise<any> {
    if (history == null) {
      return;
    }

    const transaction = new TaskHistoryTransaction();
    transaction.transactionType = TransactionType.Insert;
    transaction.transactionObject = history;
    this.transactionQueue.push(transaction);
    return;
  }

  public async queueInsertTaskHistories(histories: DTOTaskHistory[]): Promise<any> {
    if (histories == null || histories.length === 0) {
      return;
    }

    const transaction = new TaskHistoriesTransaction();
    transaction.transactionType = TransactionType.Insert;
    transaction.transactionObject = histories;
    this.transactionQueue.push(transaction);
    return;
  }

  public async queueUpdateTaskHistory(history: DTOTaskHistory): Promise<any> {
    if (history == null) {
      return;
    }

    history.Synced = false;

    const transaction = new TaskHistoryTransaction();
    transaction.transactionType = TransactionType.Update;
    transaction.transactionObject = history;
    this.transactionQueue.push(transaction);
    return;
  }

  public async queueUpdateTaskHistories(histories: DTOTaskHistory[]): Promise<any> {
    if (histories == null || histories.length === 0) {
      return;
    }

    histories.forEach(p => p.Synced = false);

    const transaction = new TaskHistoriesTransaction();
    transaction.transactionType = TransactionType.Update;
    transaction.transactionObject = histories;
    this.transactionQueue.push(transaction);
    return;
  }

  public async queueInsertTimer(timer: DTOTaskTimer): Promise<any> {
    if (timer == null) {
      return;
    }

    const transaction = new TimerTransaction();
    transaction.transactionType = TransactionType.Insert;
    transaction.transactionObject = timer;
    this.transactionQueue.push(transaction);
    console.log('queued timer', this.transactionQueue);
    return;
  }

  public async queueUpdateTimer(timer: DTOTaskTimer): Promise<any> {
    if (timer == null) {
      return;
    }

    timer.isSynced = false;

    const transaction = new TimerTransaction();
    transaction.transactionType = TransactionType.Update;
    transaction.transactionObject = timer;
    this.transactionQueue.push(transaction);
    return;
  }

  public async queueInsertGroup(group: DTOTaskGroup): Promise<any> {
    if (group == null) {
      return;
    }

    const transaction = new GroupTransaction();
    transaction.transactionType = TransactionType.Insert;
    transaction.transactionObject = group;
    this.transactionQueue.push(transaction);
    return;
  }

  public async queueInsertGroups(groups: DTOTaskGroup[]): Promise<any> {
    if (groups == null || groups.length === 0) {
      return;
    }

    const transaction = new GroupsTransaction();
    transaction.transactionType = TransactionType.Insert;
    transaction.transactionObject = groups;
    this.transactionQueue.push(transaction);
    return;
  }

  public async queueUpdateGroup(group: DTOTaskGroup, synced: boolean = false): Promise<any> {
    if (group == null) {
      return;
    }

    group.Synced = synced;

    const transaction = new GroupTransaction();
    transaction.transactionType = TransactionType.Update;
    transaction.transactionObject = group;
    this.transactionQueue.push(transaction);
    return;
  }

  public async queueUpdateGroups(groups: DTOTaskGroup[], synced: boolean = false): Promise<any> {

    console.log('queueUpdateGroups', groups);

    if (groups == null || groups.length === 0) {
      return;
    }

    groups.forEach(p => p.Synced = synced);

    const transaction = new GroupsTransaction();
    transaction.transactionType = TransactionType.Update;
    transaction.transactionObject = groups;
    this.transactionQueue.push(transaction);
    return;
  }
}

abstract class Transaction {
  public transactionObject: any;
  public transactionType: TransactionType;

  abstract processTransaction(localService: ILocalStorageService,
                              logger: ILogger): Promise<boolean>;
}

class TaskTransaction implements Transaction {
  public transactionType: TransactionType;
  public transactionObject: DTOCalendarTask;

  public async processTransaction(localService: ILocalStorageService,
                                  logger: ILogger): Promise<boolean> {
    try {
      if (this.transactionType === TransactionType.Insert) {
        await localService.insertCalendarTask(this.transactionObject as DTOCalendarTask);
      } else if (this.transactionType === TransactionType.Update) {
        await localService.updateCalendarTask(this.transactionObject as DTOCalendarTask, this.transactionObject.Synced);
      }

      return true;
    } catch (error) {
      logger.logError(error,
                      { key: 'transaction', value: JSON.stringify(this.transactionObject)});
      alert('Error processing transaction1');
      return false;
    }
  }
}

class TasksTransaction implements Transaction {
  public transactionType: TransactionType;
  public transactionObject: DTOCalendarTask[];

  public async processTransaction(localService: ILocalStorageService,
                                  logger: ILogger): Promise<boolean> {
    try {
      if (this.transactionType === TransactionType.Insert) {
        await localService.insertCalendarTasks(this.transactionObject as DTOCalendarTask[]);
      } else if (this.transactionType === TransactionType.Update) {
        // console.log('ALLO', this.transactionObject);
        await localService.updateCalendarTasks(this.transactionObject as DTOCalendarTask[], this.transactionObject[0].Synced);
      }

      return true;
    } catch (error) {
      logger.logError(error,
                      { key: 'transaction', value: JSON.stringify(this.transactionObject)});
      alert('Error processing transaction2');
      return false;
    }
  }
}

class TaskHistoryTransaction implements Transaction {
  public transactionType: TransactionType;
  public transactionObject: DTOTaskHistory;

  public async processTransaction(localService: ILocalStorageService,
                                  logger: ILogger): Promise<boolean> {
    try {
      if (this.transactionType === TransactionType.Insert) {
        // console.log('PROCESSTRANSACTION INSERT HISTORY', this.transactionObject as DTOTaskHistory);
        await localService.insertTaskHistory(this.transactionObject as DTOTaskHistory);
      } else if (this.transactionType === TransactionType.Update) {
        // console.log('PROCESSTRANSACTION UPDATE HISTORY', this.transactionObject as DTOTaskHistory);
        await localService.updateTaskHistory(this.transactionObject as DTOTaskHistory);
      }

      return true;
    } catch (error) {
      logger.logError(error,
                      { key: 'transaction', value: JSON.stringify(this.transactionObject)});
      alert('Error processing transaction 3');
      return false;
    }
  }
}

class TaskHistoriesTransaction implements Transaction {
  public transactionType: TransactionType;
  public transactionObject: DTOTaskHistory[];

  public async processTransaction(localService: ILocalStorageService,
                                  logger: ILogger): Promise<boolean> {
    try {
      if (this.transactionType === TransactionType.Insert) {
        // console.log('PROCESSTRANSACTION INSERT HISTORY', this.transactionObject as DTOTaskHistory);
        await localService.insertTaskHistories(this.transactionObject as DTOTaskHistory[]);
      } else if (this.transactionType === TransactionType.Update) {
        await localService.updateTaskHistories(this.transactionObject as DTOTaskHistory[]);
      }

      return true;
    } catch (error) {
      logger.logError(error,
                      { key: 'transaction', value: JSON.stringify(this.transactionObject)});
      alert('Error processing transaction 4');
      return false;
    }
  }
}

class TimerTransaction implements Transaction {
  public transactionType: TransactionType;
  public transactionObject: DTOTaskTimer;

  public async processTransaction(localService: ILocalStorageService,
                                  logger: ILogger): Promise<boolean> {
    try {
      if (this.transactionType === TransactionType.Insert) {
        console.log('QUEUE PROCESS INSERT TIMER', this.transactionObject);
        await localService.insertTimer(this.transactionObject as DTOTaskTimer);
      } else if (this.transactionType === TransactionType.Update) {
        await localService.updateTimer(this.transactionObject as DTOTaskTimer);
      }

      return true;
    } catch (error) {
      logger.logError(error,
                      { key: 'transaction', value: JSON.stringify(this.transactionObject)});
      alert('Error processing transaction 5');
      return false;
    }
  }
}

class GroupTransaction implements Transaction {
  public transactionType: TransactionType;
  public transactionObject: DTOTaskGroup;

  public async processTransaction(localService: ILocalStorageService,
                                  logger: ILogger): Promise<boolean> {
    try {
      if (this.transactionType === TransactionType.Insert) {
        console.log('ALLO2');
        await localService.insertGroup(this.transactionObject as DTOTaskGroup);
      } else if (this.transactionType === TransactionType.Update) {
        await localService.updateGroup(this.transactionObject as DTOTaskGroup, this.transactionObject.Synced);
      }

      return true;
    } catch (error) {
      logger.logError(error,
                      { key: 'transaction', value: JSON.stringify(this.transactionObject)});
      alert('Error processing transaction 5');
      return false;
    }
  }
}

class GroupsTransaction implements Transaction {
  public transactionType: TransactionType;
  public transactionObject: DTOTaskGroup[];

  public async processTransaction(localService: ILocalStorageService,
                                  logger: ILogger): Promise<boolean> {
    try {
      if (this.transactionType === TransactionType.Insert) {
        await localService.insertGroups(this.transactionObject as DTOTaskGroup[]);
      } else if (this.transactionType === TransactionType.Update) {
        await localService.updateGroups(this.transactionObject as DTOTaskGroup[], true);
      }

      return true;
    } catch (error) {
      logger.logError(error,
                      { key: 'transaction', value: JSON.stringify(this.transactionObject)});
      alert('Error processing transaction 6');
      return false;
    }
  }
}

enum TransactionType {
  Insert = 0,
  Update = 1
}
