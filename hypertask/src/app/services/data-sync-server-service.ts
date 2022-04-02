import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage.service';
import { DTOTaskHistory } from '../models/DTO/dto-task-history';
import { DTOCalendarTask } from '../models/DTO/dto-calendar-task';
import { CalendarTaskService } from './calendar-task.service';
import { IApiProvider } from '../interfaces/i-api-provider';
import { ILocalStorageService } from '../interfaces/i-local-storage-service';
import { CalendarTaskNotFoundError } from '../models/Exceptions/CalendarTaskNotFoundError';
import { TaskHistoryNotFoundError } from '../models/Exceptions/TaskHistoryNotFoundError';
import { ILogger } from '../interfaces/i-logger';
import { NetworkService, ConnectionStatus } from './network.service';
import { UserService } from './user.service';
import { UserConfig } from '../models/Core/user-config';
import { DTOTaskGroup } from '../models/DTO/dto-task-group';
import { GroupNotFoundError } from '../models/Exceptions/GroupNotFoundError';
import { throwError } from 'rxjs';
import { EventData, EventService } from './event.service';
import DateUtils from '../shared/date-utils';
import { DTOUser } from '../models/DTO/dto-user';
import { LoadingController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { CancellationToken } from './data-sync-2.service';

@Injectable({
  providedIn: 'root'
})
export class DataSyncServerService {

  public static GetLatestRequired: boolean = false;
  public static SyncRequired: boolean = false;
  public static GetLatestStarted: boolean = false;
  public static GetLatestInvalid: boolean = false;
  public static ApplicationLoaded: boolean = false;
  public static GetLatestRequiredReason: string = '';

  constructor(private local: ILocalStorageService,
              private apiProvider: IApiProvider,
              private calendarTaskService: CalendarTaskService,
              private logger: ILogger,
              private network: NetworkService,
              private userService: UserService,
              private eventService: EventService,
              private loadingController: LoadingController,
              private translate: TranslateService) {
    this.eventService.on(EventService.EventIds.SyncRequired, async () => {
      DataSyncServerService.SyncRequired = true;
      DataSyncServerService.GetLatestInvalid = true;
    });
  }

  public async allDataIsSynced(): Promise<boolean> {
    // console.log('allDataIsSynced');
    const allTasks = await this.local.getCalendarTasks(false);
    const unsyncedTaskData = allTasks.filter(p => p.Synced === false ||
                                                  p.Sent === false ||
                                                  p.Histories.some(t => t.Sent === false ||
                                                                        t.Synced === false));

    const storedGroups = await this.local.getGroups(false);
    const unsyncedGroupData = storedGroups.filter(p => p.Synced === false || p.Sent === false);

    if (unsyncedTaskData != null && unsyncedTaskData.length > 0) {
      // console.log('unsynced data:', unsyncedTaskData);
    } else {
      // console.log('no unsynced data:', unsyncedTaskData);
    }

    const result = unsyncedTaskData == null ||
                   unsyncedTaskData.length === 0 ||
                   unsyncedGroupData == null ||
                   unsyncedGroupData.length === 0;

    return result;
  }

  public async getUnsynchronized(): Promise<string[]> {
    console.log('getUnsynchronized');
    // this.logger.logEvent('getUnsynchronized');
    await this.local.waitForDbAvailable('getUnsynchronized');

    const result: string[] = [];

    LocalStorageService.currentlyUsed = true;

    let storedTasks = await this.local.getCalendarTasks(true);

    // console.log('got1 CheckForUnsynchronize');

    if (storedTasks != null) {
      const unSentTasks = storedTasks.filter(p => p.Sent === false);

      if (unSentTasks != null && unSentTasks.length > 0) {
        // console.log('sendUnsentTasks');
        result.push('unSentTasks');
        result.push(JSON.stringify(unSentTasks));
        result.push('');
      }
    }

    // console.log('getting1 CheckForUnsynchronize');

    storedTasks = await this.local.getCalendarTasks(true);

    // console.log('got2 CheckForUnsynchronize');

    if (storedTasks != null) {
      const unSyncedTasks = storedTasks.filter(p => p.Sent === true && p.Synced === false);

      if (unSyncedTasks != null && unSyncedTasks.length > 0) {
        result.push('unSyncedTasks');
        result.push(JSON.stringify(unSyncedTasks));
        result.push('');
      }
    }

    // console.log('getting1 CheckForUnsynchronize');

    storedTasks = await this.local.getCalendarTasks(true);

    // console.log('got3 CheckForUnsynchronize');

    if (storedTasks != null) {
      const unSentHistories = this.getUnsentHistories(storedTasks);

      if (unSentHistories != null && unSentHistories.length > 0) {
        result.push('unSentHistories');
        result.push(JSON.stringify(unSentHistories));
        result.push('');
      }
    }

    // console.log('getting1 CheckForUnsynchronize');

    storedTasks = await this.local.getCalendarTasks(true);

    // console.log('got4 CheckForUnsynchronize');

    if (storedTasks != null) {
      const unSyncedHistories = this.getUnsyncedHistories(storedTasks);

      if (unSyncedHistories != null && unSyncedHistories.length > 0) {
        result.push('unSyncedHistories');
        result.push(JSON.stringify(unSyncedHistories));
        result.push('');
      }
    }

    // UNSENT GROUPS
    const storedGroups = await this.local.getGroups(true);
    if (storedGroups != null) {
      const unSentGroups = this.getUnsentGroups(storedGroups);

      if (unSentGroups != null && unSentGroups.length > 0) {
        result.push('unSentGroups');
        result.push(JSON.stringify(unSentGroups));
        result.push('');
      }
    }

    // UNSYNCED GROUPS
    if (storedGroups != null) {
      const unSyncedGroups = this.getUnsyncedGroups(storedGroups);

      if (unSyncedGroups != null && unSyncedGroups.length > 0) {
        result.push('unSyncedGroups');
        result.push(JSON.stringify(unSyncedGroups));
        result.push('');
      }
    }

    // this.logger.logEvent('ending getUnsynchronized');

    LocalStorageService.currentlyUsed = false;

    return result;
  }

  private async processUnsynchronized(): Promise<boolean> {
    console.log('processUnsynchronized');
    // TODO : Remove this as soon as it's stable
    // const syncStart = new Date();
    this.logger.logDebug('%% CHECK FOR UNSYNCHRONIZED, LOCKING');

    await this.local.waitForDbAvailable('checkForUnsynchronized');

    LocalStorageService.currentlyUsed = true;

    let success = true;

    // this.logger.logDebug('%% CHECK FOR UNSYNCHRONIZED, LOCKED, GETTING TASKS');
    // console.log('%% CHECK FOR UNSYNCHRONIZED, LOCKED, GETTING TASKS', DateUtils.getTimeSince(syncStart));

    // await ThreadUtils.sleep(5000);

    let storedTasks = await this.local.getCalendarTasks(true);

    // console.log('got1 CheckForUnsynchronize');

    if (storedTasks != null) {
      const unSentTasks = storedTasks.filter(p => p.Sent === false);

      if (unSentTasks != null && unSentTasks.length > 0) {
        // this.logger.logDebug('%% CHECK FOR UNSYNCHRONIZED, SEND UNSENT TASKS', JSON.stringify(unSentTasks));
        if (await this.sendUnsentTasks(unSentTasks) === false) {
          success = false;
        }
        // this.logger.logDebug('%% CHECK FOR UNSYNCHRONIZED, SEND UNSENT TASKS DONE');
      }
    }

    // this.logger.logDebug('%% CHECK FOR UNSYNCHRONIZED, GET TASKS AGAIN');

    storedTasks = await this.local.getCalendarTasks(true);

    // this.logger.logDebug('%% CHECK FOR UNSYNCHRONIZED, GOT TASKS AGAIN');

    if (storedTasks != null) {
      const unSyncedTasks = storedTasks.filter(p => p.Sent === true && p.Synced === false);

      if (unSyncedTasks != null && unSyncedTasks.length > 0) {
        // console.log('unSyncedTasks : ', unSyncedTasks);
        // this.logger.logDebug('%% CHECK FOR UNSYNCHRONIZED, SYNC UNSYNCED TASKS', JSON.stringify(unSyncedTasks));
        if (await this.syncUnsyncedTasks(unSyncedTasks) === false) {
          success = false;
        }
        // this.logger.logDebug('%% CHECK FOR UNSYNCHRONIZED, SYNC UNSYNCED TASKS DONE');
      }
    }

    // this.logger.logDebug('%% CHECK FOR UNSYNCHRONIZED, GET TASKS AGAIN 2');

    storedTasks = await this.local.getCalendarTasks(true);

    // this.logger.logDebug('%% CHECK FOR UNSYNCHRONIZED, GOT TASKS AGAIN 2');

    if (storedTasks != null) {
      // this.logger.logDebug('%% CHECK FOR UNSYNCHRONIZED, GET UNSENT HISTORIES');
      const unSentHistories = this.getUnsentHistories(storedTasks);
      // this.logger.logDebug('%% CHECK FOR UNSYNCHRONIZED, GOT UNSENT HISTORIES');

      if (unSentHistories != null && unSentHistories.length > 0) {
        // this.logger.logDebug('%% CHECK FOR UNSYNCHRONIZED, SEND UNSENT HISTORIES', JSON.stringify(unSentHistories));
        if (await this.sendUnsentHistories(unSentHistories) === false) {
          success = false;
        }
        // this.logger.logDebug('%% CHECK FOR UNSYNCHRONIZED, SEND UNSENT HISTORIES DONE');
      }
    }

    // console.log('getting1 CheckForUnsynchronize');
    // this.logger.logDebug('%% CHECK FOR UNSYNCHRONIZED, GET TASKS AGAIN 3');

    storedTasks = await this.local.getCalendarTasks(true);

    // this.logger.logDebug('%% CHECK FOR UNSYNCHRONIZED, GOT TASKS AGAIN 3');

    // console.log('got4 CheckForUnsynchronize');

    if (storedTasks != null) {
      // this.logger.logDebug('%% CHECK FOR UNSYNCHRONIZED, GET UNSYNCED HISTORIES');
      const unSyncedHistories = this.getUnsyncedHistories(storedTasks);
      // this.logger.logDebug('%% CHECK FOR UNSYNCHRONIZED, GOT UNSYNCED HISTORIES');

      if (unSyncedHistories != null && unSyncedHistories.length > 0) {
        // this.logger.logDebug('%% CHECK FOR UNSYNCHRONIZED, SYNC UNSYNCED HISTORIES');
        if (await this.syncUnsyncedHistories(unSyncedHistories) === false) {
          success = false;
        }
        // this.logger.logDebug('%% CHECK FOR UNSYNCHRONIZED, SYNC UNSYNCED HISTORIES DONE');
      }
    }

    // UNSENT GROUPS
    // this.logger.logDebug('%% CHECK FOR UNSYNCHRONIZED, GETTING GROUPS 1');
    let storedGroups = await this.local.getGroups(true);
    // this.logger.logDebug('%% CHECK FOR UNSYNCHRONIZED, GOT GROUPS 1');
    if (storedGroups != null) {
      const unSentGroups = this.getUnsentGroups(storedGroups);

      if (unSentGroups != null && unSentGroups.length > 0) {
        // this.logger.logDebug('%% CHECK FOR UNSYNCHRONIZED, SEND UNSENT GROUPS');
        if (await this.sendUnsentGroups(unSentGroups) === false) {
          success = false;
        }
        // this.logger.logDebug('%% CHECK FOR UNSYNCHRONIZED, SEND UNSENT GROUPS DONE');
      }
    }

    // UNSYNCED GROUPS
    // this.logger.logDebug('%% CHECK FOR UNSYNCHRONIZED, GETTING GROUPS 2');
    storedGroups = await this.local.getGroups(true);
    // this.logger.logDebug('%% CHECK FOR UNSYNCHRONIZED, GOT GROUPS 2');
    if (storedGroups != null) {
      const unSyncedGroups = this.getUnsyncedGroups(storedGroups);

      if (unSyncedGroups != null && unSyncedGroups.length > 0) {
        // this.logger.logDebug('%% CHECK FOR UNSYNCHRONIZED, SYNC UNSYNCED GROUPS');
        if (await this.syncUnsyncedGroups(unSyncedGroups) === false) {
          success = false;
        }
        // this.logger.logDebug('%% CHECK FOR UNSYNCHRONIZED, SYNC UNSYNCED GROUPS DONE');
      }
    }

    // this.logger.logDebug('%% ENDING CHECKFORUNSYNCHRONIZED, UNLOCKING');
    // this.logger.logEvent('ending CheckForUnsynchronize');

    LocalStorageService.currentlyUsed = false;

    if (success === true) {
      DataSyncServerService.SyncRequired = false;
      this.logger.logDebug('%% SERVER SYNC COMPLETED, LOCKING');
      this.eventService.emit(new EventData(EventService.EventIds.ServerSyncCompleted, null));

      // console.log('SYNC NOT REQUIRED ANYMORE');
      return true;
    } else {
      // console.log('SYNC NOT SUCCESSFUL, STILL REQUIRED');
      return false;
    }

    // this.logger.logDebug('%% ENDING CHECKFORUNSYNCHRONIZED, UNLOCKED');
  }

  private getUnsentHistories(storedTasks: DTOCalendarTask[]): DTOTaskHistory[] {
    const unSentHistories: DTOTaskHistory[] = [];
    storedTasks.forEach(p => p.Histories.forEach(t => {
      if (t.Sent === false) {
        unSentHistories.push(t);
      }
    }));

    return unSentHistories;
  }

  private getUnsyncedHistories(storedTasks: any): any {
    const unSynchedHistories: DTOTaskHistory[] = [];
    storedTasks.forEach(p => p.Histories.forEach(t => {
      if (t.Sent === true && t.Synced === false) {
        unSynchedHistories.push(t);
      }
    }));

    return unSynchedHistories;
  }

  private getUnsentGroups(storedGroups: DTOTaskGroup[]): DTOTaskGroup[] {
    const unSentGroups: DTOTaskGroup[] = [];
    storedGroups.forEach(p => {
      if (p.Sent === false) {
        unSentGroups.push(p);
      }
    });

    return unSentGroups;
  }

  private getUnsyncedGroups(storedGroups: DTOTaskGroup[]): DTOTaskGroup[] {
    const unSyncedGroups: DTOTaskGroup[] = [];
    storedGroups.forEach(p => {
      if (p.Sent === true && p.Synced === false) {
        unSyncedGroups.push(p);
      }
    });

    return unSyncedGroups;
  }

  private async sendUnsentTasks(unSentTasks: DTOCalendarTask[]): Promise<boolean> {
    try {
      /*this.logger.logEvent('sendUnsentTasks', {
        key: 'unSentTasks',
        value: JSON.stringify(unSentTasks)
      });*/
      const calendarTaskIds = await this.apiProvider.insertCalendarTasks(unSentTasks);

      /*this.logger.logEvent('sendUnsentTasks calendarTaskIds', {
        key: 'calendarTaskIds',
        value: JSON.stringify(calendarTaskIds)
      });*/

      if (calendarTaskIds != null) {
        // tslint:disable-next-line:no-shadowed-variable
        for (const {item, index} of unSentTasks.map((item, index) => ({ item, index }))) {
          await this.setCalendarTaskAsSent(item.CalendarTaskId, true);
        }

        // this.logger.logEvent('sendUnsentTasks Done');
      }

      return true;
    } catch (error) {
      this.logger.logError(error, { key: 'unsentTasks', value: JSON.stringify(unSentTasks)});
      return false;
    }
  }

  private async syncUnsyncedTasks(unSyncedTasks: DTOCalendarTask[]): Promise<boolean> {
    try {
      /*this.logger.logEvent('syncUnsyncedTasks', {
        key: 'unSyncedTasks',
        value: JSON.stringify(unSyncedTasks)
      });*/
      const success = await this.apiProvider.updateCalendarTasks(unSyncedTasks);
      if (success) {
        for (const history of unSyncedTasks) {
          await this.setCalendarTaskAsSynced(history.CalendarTaskId);
        }
      }

      return true;
    } catch (error) {
      this.logger.logError(error, { key: 'unSyncedTasks', value: JSON.stringify(unSyncedTasks)});
      return false;
    }
  }

  private async sendUnsentHistories(unSentHistories: DTOTaskHistory[]): Promise<boolean> {
    try {
      this.logger.logEvent('sendUnsentHistories', {
        key: 'unSentHistories',
        value: JSON.stringify(unSentHistories)
      });

      // this.logger.logDebug('sending unsent histories');
      const taskHistoryIds = await this.apiProvider.insertTaskHistories(unSentHistories);
      // this.logger.logDebug('taskHistoryIds', JSON.stringify(taskHistoryIds));
      if (taskHistoryIds != null) {
        for (const history of unSentHistories) {
          await this.setTaskHistoryAsSent(history.CalendarTaskId,
                                          history.TaskHistoryId);
        }
      } else {
        this.logger.logEvent('sendUnsentHistories FAILURE (taskHistoryIds == null)', {
          key: 'history',
          value: JSON.stringify(history)
        });
      }

      return true;
    } catch (error) {
      this.logger.logError(error, { key: 'unSentHistories', value: JSON.stringify(unSentHistories)});

      return false;
    }
  }

  private async syncUnsyncedHistories(unSyncedHistories: DTOTaskHistory[]): Promise<boolean> {
    try {
      this.logger.logEvent('syncUnsyncedHistories', {
        key: 'syncUnsyncedHistories',
        value: JSON.stringify(unSyncedHistories)
      });
      const success = await this.apiProvider.updateTaskHistories(unSyncedHistories);
      if (success) {
        for (const history of unSyncedHistories) {
          /*this.logger.logEvent('syncUnsyncedHistories success', {
            key: 'history',
            value: JSON.stringify(history)
          });*/
          await this.setTaskHistoryAsSynced(history.CalendarTaskId, history.TaskHistoryId);
        }
      } else {
        this.logger.logEvent('syncUnsyncedHistories FAILURE (success==false)', {
          key: 'history',
          value: JSON.stringify(history)
        });
      }

      return true;
    } catch (error) {
      this.logger.logError(error, { key: 'unSyncedHistories', value: JSON.stringify(unSyncedHistories)});

      return false;
    }
  }

  private async sendUnsentGroups(unSentGroups: DTOTaskGroup[]): Promise<boolean> {
    try {
      /*this.logger.logEvent('unSentGroups', {
        key: 'unSentGroups',
        value: JSON.stringify(unSentGroups)
      });*/

      let success = true;
      for (const group of unSentGroups) {
        // console.log('API INSERT GROUP', group);
        if (await this.apiProvider.insertGroup(group) === false) {
          this.logger.logError(new Error('Unable to send group'),
                           { key: 'transaction', value: JSON.stringify(group)});
          success = false;
        }
      }

      if (success === true) {
        // tslint:disable-next-line:no-shadowed-variable
        for (const {item, index} of unSentGroups.map((item, index) => ({ item, index }))) {
          await this.setGroupAsSent(item.GroupId);
        }

        // this.logger.logEvent('sendUnsentGroups Done');
      }

      return true;
    } catch (error) {
      this.logger.logError(error, { key: 'sendUnsentGroups', value: JSON.stringify(unSentGroups)});
      return false;
    }
  }

  private async syncUnsyncedGroups(unSyncedGroups: DTOTaskGroup[]): Promise<boolean> {
    try {
      /*this.logger.logEvent('unSyncedGroups', {
        key: 'unSyncedGroups',
        value: JSON.stringify(unSyncedGroups)
      });*/

      let success = true;
      for (const group of unSyncedGroups) {
        if (await this.apiProvider.updateGroup(group) === false) {
          // TODO : Add error
          this.logger.logError(new Error('Unable to sync group'),
                               { key: 'transaction', value: JSON.stringify(group)});
          success = false;
        }
      }

      if (success === true) {
        // tslint:disable-next-line:no-shadowed-variable
        for (const {item, index} of unSyncedGroups.map((item, index) => ({ item, index }))) {
          await this.setGroupAsSynced(item.GroupId);
        }

        // this.logger.logEvent('syncUnsyncedGroups Done');
      }

      return true;
    } catch (error) {
      this.logger.logError(error, { key: 'syncUnsyncedGroups', value: JSON.stringify(unSyncedGroups)});
      return false;
    }
  }

  public async setCalendarTaskAsSent(oldCalendarTaskId: string, alreadyLocked: boolean = false): Promise<void> {
    // console.log('oldtaskid vs new', oldCalendarTaskId, newCalendarTaskId);
    // TODO: Check if we can get this from local instead
    const task = this.calendarTaskService.getTask(oldCalendarTaskId);
    if (task == null) {
      this.logger.logError(new Error('Unable to find calendar task index while setting as sent 2'), {
        key: 'allTasks',
        value: JSON.stringify(this.calendarTaskService.getAllTasks())
      });
      throw new CalendarTaskNotFoundError('Unable to find calendar task index while setting as sent 3');
    }

    task.Synced = true;
    task.Sent = true;

    // console.log('KKKKKKKKKK Updating date for task', task.Name);
    await this.updateLastActivityDateFromDate(task.UpdateDate, alreadyLocked);

    await this.local.updateSyncedCalendarTask(task.toDTO(), alreadyLocked);
  }

  private async updateLastActivityDateFromDate(updateDate: Date, alreadyLocked: boolean): Promise<void> {
    if (updateDate == null) {
      this.logger.logDebug('Update date is null');
      updateDate = new Date();
    }

    if (UserService.currentUser.LastActivityDate.getTime() < updateDate.getTime()) {
      // console.log('XXXXXXXXX UPDATE LAST ACTIVITY DATE', updateDate);
      this.logger.logDebug('Last activity date updated : old = ' + UserService.currentUser.LastActivityDate.toISOString());
      this.logger.logDebug('Last activity date updated : new = ' + updateDate.toISOString());
      UserService.currentUser.LastActivityDate = updateDate;
      await this.local.setUser(DTOUser.FromUser(UserService.currentUser), alreadyLocked);
      // Save local ?
    }
  }

  public async setCalendarTaskAsSynced(calendarTaskId: string): Promise<void> {
    // TODO: Check if we can get this from local instead
    const task = this.calendarTaskService.getTask(calendarTaskId);
    if (task == null) {
      this.logger.logError(new Error('Unable to find calendar task index while setting as synced'), {
        key: 'allTasks',
        value: JSON.stringify(this.calendarTaskService.getAllTasks())
      });
      throw new CalendarTaskNotFoundError('Unable to find calendar task index while setting as synced');
    }

    task.Synced = true;

    // console.log('KKKKKKKKKK Updating date for calendarTask', task.Name);
    await this.updateLastActivityDateFromDate(task.UpdateDate, true);

    await this.local.updateSyncedCalendarTask(task.toDTO(), true);
  }

  public async setTaskHistoryAsSent(calendarTaskId: string,
                                    historyId: string): Promise<void> {
    // TODO: Check if we can get this from local instead
    // this.logger.logDebug('## SET TASK HISTORY AS SENT ', calendarTaskId + ' ' + historyId);
    const task = this.calendarTaskService.getTask(calendarTaskId);
    // this.logger.logDebug('## SET TASK HISTORY GOT TASK ', task.Name);

    const historyIndex = task.Histories.findIndex(p => p.TaskHistoryId === historyId);

    /*const count = task.Histories.filter(p => p.TaskHistoryId === historyId);
    if (count.length > 1) {
      this.logger.logDebug('@@@@ MORE THAN ONE TASK =  ', JSON.stringify(count));
    }*/

    // this.logger.logDebug('## SET TASK HISTORY INDEX =  ', JSON.stringify(historyIndex));

    if (historyIndex === -1) {

      this.logger.logDebug('## Unable to find task history while setting as sent, HistoriesIds = ',
                           JSON.stringify(task.Histories.map(p => p.TaskHistoryId)));

      // console.log('Unable to find task history while setting as sent, presumably because its only in localstorage');
      this.logger.logError(new Error('Unable to find task history while setting as sent'), {
        key: 'task.Histories',
        value: JSON.stringify(task.Histories)
      });
      this.logger.logError(new Error('Unable to find task history while setting as sent2'), {
        key: 'ids',
        value: 'calendarTaskId=' + calendarTaskId + ', historyId=' + historyId
      });
      throw new TaskHistoryNotFoundError('Unable to find task history while setting as sent');
    }

    const history = task.Histories[historyIndex]; // TODO : use map
    history.Synced = true;
    history.Sent = true;

    // console.log('KKKKKKKKKK Updating date for history', history);
    await this.updateLastActivityDateFromDate(history.UpdateDate, true);

    // console.log('(SET AS SENT 1)', history);
    // this.logger.logDebug('## SET TASK HISTORY AS SENT UPDATING', calendarTaskId, historyId);
    await this.local.updateSyncedTaskHistory(history.toDTO(), true);
    // this.logger.logDebug('## SET TASK HISTORY AS SENT UPDATED', calendarTaskId, historyId);
  }

  public async setTaskHistoryAsSynced(calendarTaskId: string,
                                      newHistoryId: string): Promise<void> {
    // TODO: Check if we can get this from local instead
    // console.log('setTaskHistoryAsSynced', calendarTaskId, newHistoryId);
    const task = this.calendarTaskService.getTask(calendarTaskId);

    const historyIndex = task.Histories.findIndex(p => p.TaskHistoryId === newHistoryId); // TODO: USE MAP
    if (historyIndex === -1) {
      this.logger.logError(new Error('Unable to find task history while setting as synced'),
                           {
                             key: 'task.Histories',
                             value: JSON.stringify(task.Histories)
                           });
      this.logger.logError(new Error('Unable to find task history while setting as synced2'),
                           {
                             key: 'newHistoryId',
                             value: JSON.stringify(newHistoryId)
                           });
    }

    const history = task.Histories[historyIndex]; // TODO: Use MAP
    history.Synced = true;

    // console.log('KKKKKKKKKK Updating date for history', history);
    await this.updateLastActivityDateFromDate(history.UpdateDate, true);

    await this.local.updateSyncedTaskHistory(history.toDTO(), true);
  }

  public async setGroupAsSent(groupId: string): Promise<void> {
    // console.log('SET GROUP AS SENT', groupId);
    // console.log('oldtaskid vs new', oldCalendarTaskId, newCalendarTaskId);
    // TODO: Check if we can get this from local instead
    const allGroups = this.calendarTaskService.allGroups;
    const taskIndex = allGroups.findIndex(p => p.GroupId === groupId);
    if (taskIndex === -1) {
      this.logger.logError(new Error('Unable to find group index while setting as sent 2'), {
        key: 'allGroups',
        value: JSON.stringify(allGroups)
      });
      throw new GroupNotFoundError('Unable to find group index while setting as sent 3');
    }

    const group = allGroups[taskIndex];
    group.Synced = true;
    group.Sent = true;

    // console.log('KKKKKKKKKK Updating date for group', group.Name);
    await this.updateLastActivityDateFromDate(group.UpdateDate, true);

    await this.local.updateSyncedGroup(group.toDTO());
  }

  public async setGroupAsSynced(groupId: string): Promise<void> {
    // console.log('SET GROUP AS SYNCED', groupId, this.calendarTaskService.allGroups);
    // console.log('oldtaskid vs new', oldCalendarTaskId, newCalendarTaskId);
    // TODO: Check if we can get this from local instead
    const allGroups = this.calendarTaskService.allGroups;
    const taskIndex = allGroups.findIndex(p => p.GroupId === groupId);
    if (taskIndex === -1) {
      this.logger.logError(new Error('Unable to find group index while setting as sent 2'), {
        key: 'allGroups',
        value: JSON.stringify(allGroups)
      });
      throw new GroupNotFoundError('Unable to find group index while setting as sent 3');
    }

    const group = allGroups[taskIndex];
    group.Synced = true;

    // console.log('KKKKKKKKKK Updating date for group', group.Name);
    await this.updateLastActivityDateFromDate(group.UpdateDate, true);

    await this.local.updateGroup(group.toDTO(), true);
  }

  public async processQueue(): Promise<boolean> {
    console.log('PROCESSING QUEUE SERVER SYNC');
    if (this.calendarTaskService.getAllTasks().length > 0) {
      console.log('CHECK FOR EVENTS : CONFIGS', (await this.userService.getCurrentUser()).Config);
      // console.log('ENABLE7');
      if (this.userService.getConfig(UserConfig.EnableCloudSyncKey) === true) {
        const status = await this.network.getCurrentNetworkStatus();

        console.log(':O :O :O :O  STATUS : ', status);

        if (status === ConnectionStatus.Online) {
          // console.log('NETWORK STATUS ONLINE', status);
          return await this.processUnsynchronized();
        } else {
          // console.log('DONT CHECK FOR EVENTS 3');
        }
      } else {
        // console.log('DONT CHECK FOR EVENTS 2');
      }
    } else {
      // console.log('DONT CHECK FOR EVENTS 1');
      DataSyncServerService.SyncRequired = false;
    }

    // console.log('QUEUE PROCESSED SYNC SERVER');

    return true;
  }

  /**
   * Reloads all groups and tasks from local or server.
   * Used at the start of the application or when hitting refresh manually (for dev only, we can't put this in production)
   */
  public async reloadAllGroupsAndTasksServer(cancellationToken: CancellationToken,
                                             lastActivityDate: Date = null,
                                             apiUserConfigs: UserConfig = null): Promise<void> {
    try {
      DataSyncServerService.GetLatestStarted = true;
      DataSyncServerService.GetLatestInvalid = false;

      let dtoTasks: DTOCalendarTask[] = [];
      let dtoGroups: DTOTaskGroup[] = [];

      dtoGroups = await this.calendarTaskService.getAllGroupsFromServer();

      if (cancellationToken.cancelRequested === true) {
        console.log('CANCELATION TOKEN CANCEL 1');
        return;
      }

      dtoTasks = await this.calendarTaskService.getAllTodoFromServer((await this.calendarTaskService.getTaskListDTORequest()));
      if (dtoTasks == null) {
        this.logger.logError(new Error('Unable to reload tasks'));
        return throwError('Unable to reload tasks').toPromise();
      }

      // Check if everything is synced or else abort refresh to avoid conflict
      if (await this.CanEndRefresh() === false) {
        this.logger.logDebug('XXXXXXXXXXXX CANT REFRESH ABORT :( :(');
        DataSyncServerService.GetLatestStarted = false;
        DataSyncServerService.GetLatestRequired = true;
        return;
      } else {
        if (lastActivityDate != null) {
          this.logger.logDebug('XXXXXXXXXXXX CAN REFRESH :) :)', lastActivityDate.toISOString());
        } else {
          this.logger.logDebug('XXXXXXXXXXXX CAN REFRESH :) :)');
        }
      }

      // TODO : lock database for this operation, save to local
      // TODO : Test
      const loading = await this.loadingController.create({
        message: this.translate.instant('local-storage.refreshing-data'),
      });
      // await this.loadingController.dismiss(null, null, 'reload-server');
      await loading.present();

      await this.local.setGroupsAndTasks(dtoGroups, dtoTasks);
      await this.calendarTaskService.processAndAssignAllGroupsAndTasks(dtoTasks, dtoGroups);

      if (lastActivityDate != null) {
        UserService.currentUser.LastActivityDate = lastActivityDate;

        if (apiUserConfigs != null) {
          // console.log('API CONFIGS : ', apiUserConfigs);
          UserService.currentUser.Config = apiUserConfigs;
        }

        await this.local.setUser(DTOUser.FromUser(UserService.currentUser), false);
      }

      await loading.dismiss();

      DataSyncServerService.GetLatestStarted = false;
      DataSyncServerService.GetLatestRequired = false;
      DataSyncServerService.GetLatestInvalid = false;
      this.logger.logDebug('XXXXXXXXXXXX REFRESH COMPLETED');
    } catch (error) {
      DataSyncServerService.GetLatestStarted = false;
      DataSyncServerService.GetLatestRequired = true;
      DataSyncServerService.GetLatestRequiredReason = 'Reload failed';
      // console.log('Error refreshing all', error);
      this.logger.logError(error);
    }
  }

  public async CanStartRefresh(): Promise<boolean> {
    /*console.log('CAN REFRESH : ',
                await this.allDataIsSynced(),
                DataSyncServerService.SyncRequired,
                DataSyncServerService.ApplicationLoaded);*/
    return await this.allDataIsSynced() === true &&
           DataSyncServerService.SyncRequired === false &&
           DataSyncServerService.GetLatestStarted === false &&
           DataSyncServerService.ApplicationLoaded === true;
  }

  public async CanEndRefresh(): Promise<boolean> {
    // console.log('CAN REFRESH : ', await this.allDataIsSynced(),
    // DataSyncServerService.SyncRequired, DataSyncServerService.GetLatestInvalid);
    return await this.allDataIsSynced() === true &&
           DataSyncServerService.SyncRequired === false &&
           DataSyncServerService.GetLatestInvalid === false;
  }

  public async GetLatest(cancellationToken: CancellationToken): Promise<boolean> {
    // console.log('GETLATEST');
    const ready = await this.userService.awaitUserReady();
    // console.log('USER IS READY', ready);

    if (this.userService.getConfig(UserConfig.EnableCloudSyncKey) === true) { // Only sync if cloud is enabled
      // console.log('SYNC ENABLED');
      if (DataSyncServerService.GetLatestRequired === true) {
        this.logger.logDebug('GET LATEST REQUIRED', DataSyncServerService.GetLatestRequiredReason);
        // console.log('GETTING USER : ', UserService.currentUserId, new Date());
        const DTOapiUser = await this.apiProvider.getUser(UserService.currentUserId);
        const apiUser = DTOUser.ToUser(DTOapiUser);
        // console.log('USER FROM API : ', apiUser);
        if (apiUser == null) { // if account not yet created
          return true;
        }
        if (DataSyncServerService.SyncRequired === true) {
          return true;
        }
        if (cancellationToken.cancelRequested === true) {
          console.log('CANCELATION TOKEN CANCEL 2');
          return true;
        }

        // if (apiUser.LastActivityDate == null) {
          // console.log('ACTIVITY DATE = NULL');
          // user.LastActivityDate = (DateUtils.YearAgo()).toISOString();
        // }

        if (!DateUtils.dateTimeAreEqual(apiUser.LastActivityDate, UserService.currentUser.LastActivityDate) &&
            DataSyncServerService.SyncRequired === false) {
          this.logger.logDebug('GET LATEST REQUIRED USER NOT SYNCED');

          if (UserService.currentUser.LastActivityDate == null) {
            UserService.currentUser.LastActivityDate = DateUtils.YearAgo();
          }

          DataSyncServerService.GetLatestRequired = true;
          DataSyncServerService.GetLatestRequiredReason = 'Last activity dates : ' +
                                                          apiUser.LastActivityDate.toISOString() +
                                                          ' ,' +
                                                          UserService.currentUser.LastActivityDate.toISOString();

          this.logger.logDebug('Users not synced : ' + DataSyncServerService.GetLatestRequiredReason);
          // this.eventService.emit(new EventData(EventService.EventIds.ReloadFromServer, null));

          if (await this.CanStartRefresh() === true) {
            this.logger.logDebug('Can start refresh, STARTING REFRESH 2');
            await this.reloadAllGroupsAndTasksServer(cancellationToken,
                                                     apiUser.LastActivityDate,
                                                     apiUser.Config);
          } else {
            this.logger.logDebug('Unable to refresh, retrying later');
          }
        } else {
          this.logger.logDebug('USER SYNCED');
          DataSyncServerService.GetLatestRequired = false;
        }
      } else {
        this.logger.logDebug('GET LATEST NOT REQUIRED');
      }
    } else {
      // console.log('SYNC NOT ENABLED');
    }
  }
}
