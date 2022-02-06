import { Injectable } from '@angular/core';
import { DTOCalendarTask } from '../models/DTO/dto-calendar-task';
import { Storage } from '@ionic/storage';
import { DTOTaskHistory } from '../models/DTO/dto-task-history';
import { DatabaseLockedError } from '../models/Exceptions/DatabaseLockedError';
import { ILogger } from '../interfaces/i-logger';
import { ILocalStorageService } from '../interfaces/i-local-storage-service';
import ThreadUtils from '../shared/thread.utils';
import { TranslateService } from '@ngx-translate/core';
import { DTOUser } from '../models/DTO/dto-user';
import { DTOUserConfig } from '../models/DTO/dto-user-config';
import { DTOTaskTimer } from '../models/DTO/dto-timer';
import { DTOTaskGroup } from '../models/DTO/dto-task-group';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService implements ILocalStorageService {

  public static currentlyUsed: boolean = false;
  // TODO: Use non-static variable. For now it's assignation gets lost because of scoping issues
  public static TIMER_KEY: string;
  public static CALENDAR_TASK_KEY: string;
  public static LAST_READ_CHANGELOG_VERSION_KEY: string = 'lastReadChangelogVersion';
  public static USER_KEY: string = 'user';
  public static GROUPS_KEY: string;
  public static LastUsedDatabaseReason: string;

  public Initialized: boolean = false;

  constructor(private storage: Storage,
              private logger: ILogger,
              private translate: TranslateService) { }

  public async insertCalendarTasks(tasks: DTOCalendarTask[]): Promise<any> {
    try {
      // this.logger.logDebug('{inserting task locally, LOCKING}', new Date().toISOString());
      await this.lockLocalStorage(false, 'insertCalendarTasks');
      // this.logger.logDebug('{inserting task locally, LOCKED, GETTING TASKS}', new Date().toISOString());
      LocalStorageService.LastUsedDatabaseReason = 'insertCalendarTasks' + (new Date()).toISOString();

      const localTasks = await this.getCalendarTasks(true);
      // this.logger.logDebug('{inserting task locally, GOT TASKS, SETTING TASKS}', new Date().toISOString());
      tasks.forEach(p => localTasks.push(p));
      const result = await this.setCalendarTasks(localTasks, true);
      // this.logger.logDebug('{inserting task locally, SET TASKS DONE}', new Date().toISOString());
      return;
    } catch (error) {
      this.logger.logError(new Error('unable to read from local database insertCalendarTasks1 ' + error));
      alert('unable to read from local database 33');
      return;
    } finally {
      // this.logger.logDebug('{insert task FINALLY UNLOCKING}', new Date().toISOString());
      this.unlockLocalStorage(false);
      // this.logger.logDebug('{insert task FINALLY UNLOCKED}', new Date().toISOString());
    }
  }

  public async insertTaskHistories(histories: DTOTaskHistory[]): Promise<any> {
    try {
      /*this.logger.logDebug('inserting history locally (ATTEMPTING TO LOCK)',
                            JSON.stringify(history),
                            LocalStorageService.LastUsedDatabaseReason);*/
      await this.lockLocalStorage(false, 'insertTaskHistories');
      LocalStorageService.LastUsedDatabaseReason = 'insertTaskHistories_' + (new Date()).toISOString();

      // this.logger.logDebug('inserting history locally (LOCKED)', JSON.stringify(history));
      const tasks = await this.getUpdatedTasksHistoriesInserted(histories);
      await this.setCalendarTasks(tasks, true);
      // this.logger.logDebug('inserted history locally (UNLOCKING)', JSON.stringify(history));
      return;
    } catch (error) {
      this.logger.logDebug('ERROR insertTaskHistory', JSON.stringify(error));
      alert('unable inserting task histories');
      return;
    } finally {
      this.unlockLocalStorage(false);
    }
  }

  public async updateTaskHistories(histories: DTOTaskHistory[]): Promise<any> {
    // console.log('updating history locally', history);
    try {
      await this.lockLocalStorage(false, 'updateTaskHistories');
      LocalStorageService.LastUsedDatabaseReason = 'updateTaskHistories' + (new Date()).toISOString();

      histories.forEach(p => p.Synced = false);
      const tasks = await this.getUpdatedTasksHistoriesUpdated(histories);
      await this.setCalendarTasks(tasks, true);
      return;
    } catch (error) {
      this.logger.logError(new Error('unable to read from local database updateTaskHistories1 ' + error));
      alert('unable to read from local database 77');
      return;
    } finally {
      this.unlockLocalStorage(false);
    }
  }

  public async insertGroups(groups: DTOTaskGroup[]): Promise<void> {
    // console.log('INSERTING GROUP LOCAL STORAGE', group);
    await this.lockLocalStorage(false, 'setGroups');
    LocalStorageService.LastUsedDatabaseReason = 'setGroups ' + (new Date()).toISOString();

    try {
      const localGroups = await this.getGroups(true);
      groups.forEach(p => localGroups.push(p));
      await this.setGroups(localGroups, true);
      return;
    } catch (error) {
      // console.error('error');
      this.logger.logError(new Error('unable to set groups in local database'));
      alert('unable to read from local database 122');
      return null;
    } finally {
      this.unlockLocalStorage(false);
    }
  }

  public async updateGroups(groups: DTOTaskGroup[], alreadyLocked: boolean): Promise<void> {
    // console.log('UPDATING GROUP LOCAL STORAGE', group);

    if (alreadyLocked === false) {
      await this.lockLocalStorage(false, 'setGroups');
      LocalStorageService.LastUsedDatabaseReason = 'setGroups ' + (new Date()).toISOString();
    }

    try {
      const localGroups = await this.getGroups(true);
      for (const group of groups) {
        const index = localGroups.findIndex(p => p.GroupId === group.GroupId);
        localGroups[index] = group;
      }

      await this.setGroups(localGroups, true);
      return;
    } catch (error) {
      // console.error('error');
      this.logger.logError(new Error('unable to set groups in local database'));
      alert('unable to read from local database 133');
      return null;
    } finally {
      if (alreadyLocked === false) {
        this.unlockLocalStorage(false);
      }
    }
  }

  public async initialize(userId: string): Promise<void> {
    if (userId == null) {
      // console.log('local storage userId is null');
      return;
    }

    LocalStorageService.CALENDAR_TASK_KEY = String('calendarTasks' + userId);
    LocalStorageService.TIMER_KEY = String('timer' + userId);
    LocalStorageService.GROUPS_KEY = String('group' + userId);

    // console.log('Initialized Local storage');

    this.Initialized = true;

    return;
  }

  public async terminate(): Promise<void> {
    // this.logger.logDebug('TERMINATE, Currently used:', String(LocalStorageService.currentlyUsed));
    // console.log('TERMINATE, Currently used:', LocalStorageService.currentlyUsed);
    await this.waitForDbAvailable('terminate');
    LocalStorageService.CALENDAR_TASK_KEY = '';
    LocalStorageService.TIMER_KEY = '';
    LocalStorageService.GROUPS_KEY = '';
    this.Initialized = false;
  }

  public async getUser(userId: string): Promise<DTOUser> {
    // console.log('getting user from local (awaiting)');
    await this.lockLocalStorage(false, 'getUser');
    // console.log('getting user from local');
    LocalStorageService.LastUsedDatabaseReason = 'getUser ' + (new Date()).toISOString();

    try {
      const user = await this.storage.get(LocalStorageService.USER_KEY + userId) as DTOUser;
      // console.log('got user');
      if (user.Config.Configs == null || user.Config.Configs.length == null) {
        // console.log('INITIALIZING NEW CONFIGS');
        user.Config = new DTOUserConfig();
      } /*else {
        console.log('USER CONFIG', user, user.Config.Configs.length);
        console.log('USER', user);
      }*/
      return user;
    } catch (error) {
      // console.log('cant get local user (normal first usage)');
      // this.logger.logError(new Error('unable to read user from local database')); Removed log because this is normal when first install
      // Cant display this because it happens when we create a new account
      // alert('unable to read user from local database');
      return null;
    } finally {
      this.unlockLocalStorage(false);
    }
  }

  public async setUser(user: DTOUser, alreadyLocked: boolean = false): Promise<void> {
    await this.lockLocalStorage(alreadyLocked, 'setUser');
    LocalStorageService.LastUsedDatabaseReason = 'setUser ' + (new Date()).toISOString();

    try {
      // console.log('SETTING USER LOCALLY : ', user);
      await this.storage.set(LocalStorageService.USER_KEY + user.UserId, user);
      return;
    } catch (error) {
      // console.error('error');
      this.logger.logError(new Error('unable to set user in local database'));
      alert('unable to set user in local database');
      return null;
    } finally {
      this.unlockLocalStorage(false);
    }
  }

  public async setCalendarTasks(tasks: DTOCalendarTask[],
                                alreadyReadOnly: boolean = false): Promise<boolean> {
    // const dateStart = new Date();
    // this.logger.logDebug('setCalendarTasks');
    await this.lockLocalStorage(alreadyReadOnly, 'setCalendarTasks');
    LocalStorageService.LastUsedDatabaseReason = 'setCalendarTasks ' + (new Date()).toISOString();

    try {
      await this.setCalendarTasksToDatabase(tasks);

      return true;
    } catch (error) {
      this.logger.logError(new Error('unable to read from local database 3'), error);
      alert('unable to read from database 3');

      return false;
    } finally {
      this.unlockLocalStorage(alreadyReadOnly);
      // this.logger.logDebug('SET CALENDAR TASKS COMPLETED IN ', DateUtils.getTimeSince(dateStart));
    }
  }

  public async getCalendarTasks(alreadyLocked: boolean = false): Promise<DTOCalendarTask[]> {
    // this.logger.logDebug('GETCALENDARTASKS LOCKING', new Date().toISOString());

    await this.lockLocalStorage(alreadyLocked, 'getCalendarTasks');

    /*if (alreadyLocked === false) {
      this.logger.logDebug('GETCALENDARTASKS LOCKED', new Date().toISOString());
    }*/

    LocalStorageService.LastUsedDatabaseReason = 'getCalendarTasks' + (new Date()).toISOString();

    try {
      const tasks = await this.getCalendarTasksFromDatabase();
      // console.log('TASKS', tasks);
      return tasks.filter(p => p.CalendarTaskId != null);
    } catch (error) {
      this.logger.logError(new Error('unable to read from local database getCalendarTasks1 ' + error));
      alert('unable to read from local database 2');
      return [];
    } finally {
      if (alreadyLocked === false) {
        // this.logger.logDebug('GETCALENDARTASKS UNLOCKING', new Date().toISOString());
        // this.logger.logDebug('GETCALENDARTASKS ALREADY LOCKED', String(alreadyLocked));
      }

      this.unlockLocalStorage(alreadyLocked);

      /*if (alreadyLocked === false) {
        this.logger.logDebug('GETCALENDARTASKS UNLOCKED', new Date().toISOString());
      }*/
    }
  }

  private async getCalendarTasksFromDatabase(): Promise<DTOCalendarTask[]> {
    // this.logger.logDebug('getCalendarTasksFromDatabase', LocalStorageService.CALENDAR_TASK_KEY);
    if (LocalStorageService.CALENDAR_TASK_KEY == null) {
      return [];
    }

    // this.logger.logDebug('getCalendarTasksFromDatabase2', LocalStorageService.CALENDAR_TASK_KEY, new Date().toISOString());

    //await this.storage.ready;

    // this.logger.logDebug('isReady', LocalStorageService.CALENDAR_TASK_KEY, new Date().toISOString());

    const tasks = await this.storage.get(LocalStorageService.CALENDAR_TASK_KEY);
    if (tasks == null) {
      // console.log('Tasks is null');
      return [];
    }
    // this.logger.logDebug('gotCalendarTasksFromDatabase TASKS', new Date().toISOString());
    const allTasks = tasks.map(p => DTOCalendarTask.fromAny(p));
    // this.logger.logDebug('gotCalendarTasksFromDatabase', new Date().toISOString());
    return allTasks;
  }

  private async setCalendarTasksToDatabase(tasks: DTOCalendarTask[]): Promise<void> {
    // this.logger.logDebug('setSetCalendarTasksToDatabase');
    //await this.storage.ready;
    await this.storage.set(LocalStorageService.CALENDAR_TASK_KEY, tasks);
    return;
  }

  public async insertCalendarTask(task: DTOCalendarTask): Promise<any> {
    try {
      // this.logger.logDebug('{inserting task locally, LOCKING}', new Date().toISOString());
      await this.lockLocalStorage(false, 'insertCalendarTask');
      // this.logger.logDebug('{inserting task locally, LOCKED, GETTING TASKS}', new Date().toISOString());
      LocalStorageService.LastUsedDatabaseReason = 'insertCalendarTask' + (new Date()).toISOString();

      const tasks = await this.getCalendarTasks(true);
      // this.logger.logDebug('{inserting task locally, GOT TASKS, SETTING TASKS}', new Date().toISOString());
      tasks.push(task);
      const result = await this.setCalendarTasks(tasks, true);
      // this.logger.logDebug('{inserting task locally, SET TASKS DONE}', new Date().toISOString());
      return;
    } catch (error) {
      this.logger.logError(new Error('unable to read from local database insertCalendarTask1 ' + error));
      alert('unable to read from local database 3');
      return;
    } finally {
      // this.logger.logDebug('{insert task FINALLY UNLOCKING}', new Date().toISOString());
      this.unlockLocalStorage(false);
      // this.logger.logDebug('{insert task FINALLY UNLOCKED}', new Date().toISOString());
    }
  }

  public async updateCalendarTask(task: DTOCalendarTask, synced: boolean = false): Promise<any> {
    // console.log('updating task locally', task);
    try {
      // console.log('{updading task locally, LOCKING}', task, new Date().toISOString());
      await this.lockLocalStorage(false, 'updateCalendarTask');
      // console.log('{updaded task locally, LOCKED}', new Date().toISOString());
      LocalStorageService.LastUsedDatabaseReason = 'updateCalendarTask' + (new Date()).toISOString();

      task.Synced = synced;
      const tasks = await this.getUpdatedTasks(task);
      // console.log('{updating task locally, GOT TASKS, SETTING TASKS}', new Date().toISOString());
      await this.setCalendarTasks(tasks, true);
      return;
    } catch (error) {
      this.logger.logError(new Error('unable to read from local database updateCalendarTask1 ' + error));
      alert('unable to read from local database 4');
      return;
    } finally {
      // console.log('{update task FINALLY UNLOCKING}', new Date().toISOString());
      this.unlockLocalStorage(false);
      // console.log('{update task FINALLY UNLOCKING}', new Date().toISOString());
    }
  }

  public async updateCalendarTasks(tasks: DTOCalendarTask[], synced: boolean = false): Promise<any> {
    // console.log('updating tasks locally', tasks);
    try {
      // console.log('{updading tasks locally, LOCKING}', tasks, new Date().toISOString());
      await this.lockLocalStorage(false, 'updateCalendarTasks');
      // console.log('{updading tasks locally, LOCKED}', new Date().toISOString());
      LocalStorageService.LastUsedDatabaseReason = 'updateCalendarTasks' + (new Date()).toISOString();

      tasks.forEach(p => p.Synced = synced);
      const allTasks = await this.getUpdatedTasksBatch(tasks);
      // console.log('{inserting tasks locally, GOT TASKS, SETTING TASKS}', new Date().toISOString());
      await this.setCalendarTasks(allTasks, true);
      return;
    } catch (error) {
      this.logger.logError(new Error('unable to read from local database updateCalendarTasks1 ' + error));
      alert('unable to read from local database 5');
      return;
    } finally {
      // console.log('{update tasks FINALLY UNLOCKING}', new Date().toISOString());
      this.unlockLocalStorage(false);
      // console.log('{update tasks FINALLY UNLOCKING}', new Date().toISOString());
    }
  }

  public async updateSyncedCalendarTask(task: DTOCalendarTask, alreadyLocked: boolean = false): Promise<any> {
    // console.log('updateSyncedCalendarTask');
    // await this.waitForDbAvailable(); don't put this on, it causes a bug, or put a parameter
    // console.log('lock (updateSyncedCalendarTask)');
    try {
      /*if (LocalStorageService.currentlyUsed === true) {
        this.logger.logError(new Error('updateSyncedCalendarTask already in use'));
      }*/
      if (alreadyLocked === true) {
        // console.log('{updading synced task locally, LOCKING}', task, new Date().toISOString());
        LocalStorageService.currentlyUsed = true;
        // console.log('{updading synced task locally, LOCKED}', task, new Date().toISOString());
        LocalStorageService.LastUsedDatabaseReason = 'updateSyncedCalendarTask' + (new Date()).toISOString();
      }

      // await this.lockLocalStorage(false); // don't put this on, it causes a bug, or put a parameter
      const tasks = await this.getUpdatedTasks(task);
      // console.log('{updating synced task locally, GOT TASKS, SETTING TASKS}', new Date().toISOString());
      await this.setCalendarTasks(tasks, true);
      return;
    } catch (error) {
      this.logger.logError(new Error('unable to read from local database updateSyncedCalendarTask1 ' + error));
      alert('unable to read from local database 6');
    } finally {
      if (alreadyLocked === true) {
        // console.log('{update synced tasks FINALLY UNLOCKING}', new Date().toISOString());
        this.unlockLocalStorage(alreadyLocked); // Are we sure we want to unlock ?
        // console.log('{update synced tasks FINALLY UNLOCKING}', new Date().toISOString());
      }
    }
  }

  private async getUpdatedTasks(task: DTOCalendarTask) {
    // console.log('getUpdatedTasks');
    const tasks = await this.getCalendarTasks(true);
    const index = tasks.findIndex(p => p.CalendarTaskId === task.CalendarTaskId);
    tasks[index] = task;
    return tasks;
  }

  private async getUpdatedTasksBatch(tasks: DTOCalendarTask[]) {
    // console.log('getUpdatedTasks');
    const allTasks = await this.getCalendarTasks(true);

    for (const task of tasks) {
      const index = allTasks.findIndex(p => p.CalendarTaskId === task.CalendarTaskId);
      allTasks[index] = task;
    }

    return allTasks;
  }

  public async insertTaskHistory(history: DTOTaskHistory): Promise<any> {
    try {
      /*this.logger.logDebug('inserting history locally (ATTEMPTING TO LOCK)',
                            JSON.stringify(history),
                            LocalStorageService.LastUsedDatabaseReason);*/
      await this.lockLocalStorage(false, 'insertTaskHistory');
      LocalStorageService.LastUsedDatabaseReason = 'insertTaskHistory_' + (new Date()).toISOString();

      // this.logger.logDebug('inserting history locally (LOCKED)', JSON.stringify(history));
      const tasks = await this.getUpdatedTasksHistoryInserted(history);
      await this.setCalendarTasks(tasks, true);
      // this.logger.logDebug('inserted history locally (UNLOCKING)', JSON.stringify(history));
      return;
    } catch (error) {
      this.logger.logDebug('ERROR insertTaskHistory', JSON.stringify(error));
      alert('unable inserting task history');
      return;
    } finally {
      this.unlockLocalStorage(false);
    }
  }

  public async updateTaskHistory(history: DTOTaskHistory): Promise<any> {
    // console.log('updating history locally', history);
    try {
      await this.lockLocalStorage(false, 'updateTaskHistory');
      LocalStorageService.LastUsedDatabaseReason = 'updateTaskHistory' + (new Date()).toISOString();

      history.Synced = false;
      const tasks = await this.getUpdatedTasksHistoryUpdated(history);
      await this.setCalendarTasks(tasks, true);
      return;
    } catch (error) {
      this.logger.logError(new Error('unable to read from local database updateTaskHistory1 ' + error));
      alert('unable to read from local database 7');
      return;
    } finally {
      this.unlockLocalStorage(false);
    }
  }

  public async updateSyncedTaskHistory(history: DTOTaskHistory, alreadySynced: boolean = false): Promise<any> {
    // this.logger.logDebug('lock (updateSyncedTaskHistory)');
    try {
      if (alreadySynced === false) {
        LocalStorageService.currentlyUsed = true;
        LocalStorageService.LastUsedDatabaseReason = 'updateSyncedTaskHistory' + (new Date()).toISOString();
      }

      const tasks = await this.getUpdatedTasksHistoryUpdated2(history);
      // this.logger.logDebug('SETTING TASKS:', JSON.stringify(tasks));
      // this.logger.logDebug('## updateSyncedTaskHistory SETTING CALENDAR TASKS');
      await this.setCalendarTasks(tasks, true);
      // this.logger.logDebug('## updateSyncedTaskHistory SET CALENDAR TASKS');
      return;
    } catch (error) {
      this.logger.logError(new Error('unable to read from local database updateSyncedTaskHistory1 ' + error));
      alert('unable to read from local database 8');
      return;
    } finally {
      this.unlockLocalStorage(alreadySynced); // Are we sure we want to unlock ?
    }
  }

  public async updateSyncedGroup(group: DTOTaskGroup): Promise<any> {
    // this.logger.logDebug('lock (updateSyncedTaskHistory)');
    try {
      const groups = await this.getUpdatedGroups(group);
      // this.logger.logDebug('SETTING TASKS:', tasks);
      // this.logger.logDebug('## updateSyncedTaskHistory SETTING CALENDAR TASKS');
      await this.setGroups(groups, true);
      // this.logger.logDebug('## updateSyncedTaskHistory SET CALENDAR TASKS');
      return;
    } catch (error) {
      this.logger.logError(new Error('unable to read from local database updateSyncedTaskHistory1 ' + error));
      alert('unable to read from local database 9');
      return;
    }
  }

  private async getUpdatedTasksHistoryInserted(history: DTOTaskHistory) {
    // console.log('getUpdatedTasksHistoryInserted');
    const tasks = await this.getCalendarTasks(true);
    const task = tasks.filter(p => p.CalendarTaskId === history.CalendarTaskId)[0];
    // this.logger.logDebug('pushing histories');
    if (!task.Histories.some(p => p.TaskHistoryId === history.TaskHistoryId)) {
      task.Histories.push(history);
    } else {
      this.logger.logError(new Error('HISTORY ALREADY EXISTS'),
                           { key: 'transaction', value: JSON.stringify(history)});
    }

    return tasks;
  }

  private async getUpdatedTasksHistoriesInserted(histories: DTOTaskHistory[]) {
    // console.log('getUpdatedTasksHistoryInserted');
    const tasks = await this.getCalendarTasks(true);
    for (const history of histories) {
      const task = tasks.filter(p => p.CalendarTaskId === history.CalendarTaskId)[0];
      // this.logger.logDebug('pushing histories');
      if (!task.Histories.some(p => p.TaskHistoryId === history.TaskHistoryId)) {
        task.Histories.push(history);
      } else {
        this.logger.logError(new Error('HISTORY ALREADY EXISTS'),
                             { key: 'transaction', value: JSON.stringify(history)});
      }
    }

    return tasks;
  }

  private async getUpdatedTasksHistoryUpdated(history: DTOTaskHistory) {
    // this.logger.logDebug('getUpdatedTasksHistoryUpdated');
    const tasks = await this.getCalendarTasks(true);
    const task = tasks.filter(p => p.CalendarTaskId === history.CalendarTaskId)[0];
    const index = task.Histories.findIndex(p => p.TaskHistoryId === history.TaskHistoryId);
    task.Histories[index] = history;
    return tasks;
  }

  private async getUpdatedTasksHistoriesUpdated(histories: DTOTaskHistory[]) {
    // this.logger.logDebug('getUpdatedTasksHistoryUpdated');
    const tasks = await this.getCalendarTasks(true);
    for (const history of histories) {
      const task = tasks.filter(p => p.CalendarTaskId === history.CalendarTaskId)[0];
      const index = task.Histories.findIndex(p => p.TaskHistoryId === history.TaskHistoryId);
      task.Histories[index] = history;
    }

    return tasks;
  }

  private async getUpdatedTasksHistoryUpdated2(history: DTOTaskHistory) {
    // this.logger.logDebug('getUpdatedTasksHistoryUpdated2');
    const tasks = await this.getCalendarTasks(true);
    const taskIndex = tasks.findIndex(p => p.CalendarTaskId === history.CalendarTaskId);
    // this.logger.logDebug('taskIndex = ', JSON.stringify(taskIndex));
    const task = tasks[taskIndex];
    const historyIndex = task.Histories.findIndex(p => p.TaskHistoryId === history.TaskHistoryId);
    task.Histories[historyIndex] = history;
    tasks[taskIndex] = task;
    return tasks;
  }

  private async getUpdatedGroups(group: DTOTaskGroup) {
    // console.log('[ GET UPDATED GROUP ]', group);
    // console.log('getUpdatedTasksHistoryUpdated2');
    const groups = await this.getGroups(true);
    const groupIndex = groups.findIndex(p => p.GroupId === group.GroupId);
    // console.log('taskIndex = ', taskIndex);
    groups[groupIndex] = group;
    return groups;
  }

  public async clear(): Promise<void> {
    await this.storage.clear();
    return;
  }

  public async shouldViewChangeLog(currentVersion: string): Promise<boolean> {
    //await this.storage.ready;
    const lastReadVersion = await this.storage.get(LocalStorageService.LAST_READ_CHANGELOG_VERSION_KEY);

    if (lastReadVersion != null) {
      if (lastReadVersion !== currentVersion) {
        return true;
      } else {
        return false;
      }
    } else {
      this.storage.set(LocalStorageService.LAST_READ_CHANGELOG_VERSION_KEY, currentVersion);
      return false;
    }
  }

  public async setChangeLogToViewed(currentVersion: string): Promise<boolean> {
    await this.storage.set(LocalStorageService.LAST_READ_CHANGELOG_VERSION_KEY, currentVersion);
    return true;
  }

  public async getTimers(alreadyLocked: boolean = false): Promise<DTOTaskTimer[]> {
    // this.logger.logDebug('GETTING TIMERS)');
    await this.lockLocalStorage(alreadyLocked, 'getTimers');
    LocalStorageService.LastUsedDatabaseReason = 'getTimers ' + (new Date()).toISOString();

    try {
      let timers = await this.storage.get(LocalStorageService.TIMER_KEY) as DTOTaskTimer[];
      // this.logger.logDebug('LOCAL GETTIMERS : ', JSON.stringify(timers));
      if (timers == null || timers.length == null) {
        // console.log('INITIALIZING NEW TIMERS');
        timers = [];
      } else {
        // TODO : Maybe we will need timers someday, right now we are filtering the completed ones
        timers = timers.filter(p => p.isDone === false && p.isVoid !== true);
      }
      return timers;
    } catch (error) {
      this.logger.logError(new Error('unable to read timers from local database'));
      return null;
    } finally {
      this.unlockLocalStorage(alreadyLocked);
    }
  }

  public async setTimers(timers: DTOTaskTimer[],
                         alreadyReadOnly: boolean = false): Promise<void> {
    await this.lockLocalStorage(alreadyReadOnly, 'setTimers');
    LocalStorageService.LastUsedDatabaseReason = 'setTimers ' + (new Date()).toISOString();

    try {
      // console.log('LOCAL SET TIMERS', timers, LocalStorageService.TIMER_KEY);
      await this.storage.set(LocalStorageService.TIMER_KEY, timers);
      return;
    } catch (error) {
      // console.error('error');
      this.logger.logError(new Error('unable to set timers in local database'));
      return null;
    } finally {
      this.unlockLocalStorage(alreadyReadOnly);
    }
  }

  public async insertTimer(timer: DTOTaskTimer): Promise<void> {
    // this.logger.logDebug('INSERTING TIMER LOCAL STORAGE', JSON.stringify(timer));
    await this.lockLocalStorage(false, 'setTimer');
    LocalStorageService.LastUsedDatabaseReason = 'setTimer ' + (new Date()).toISOString();

    try {
      const timers = await this.getTimers(true);
      timers.push(timer);
      await this.setTimers(timers, true);
      return;
    } catch (error) {
      // console.error('error');
      this.logger.logError(new Error('unable to set timer in local database'));
      return null;
    } finally {
      this.unlockLocalStorage(false);
    }
  }

  public async updateTimer(timer: DTOTaskTimer): Promise<void> {
    // console.log('UPDATING TIMER LOCAL STORAGE', timer);
    await this.lockLocalStorage(false, 'setTimer');
    LocalStorageService.LastUsedDatabaseReason = 'setTimer ' + (new Date()).toISOString();

    try {
      const timers = await this.getTimers(true);
      const index = timers.findIndex(p => p.TimerId === timer.TimerId);
      timers[index] = timer;
      await this.setTimers(timers, true);
      return;
    } catch (error) {
      // console.error('error');
      this.logger.logError(new Error('unable to set timer in local database'));
      return null;
    } finally {
      this.unlockLocalStorage(false);
    }
  }

  public async getGroups(alreadyLocked: boolean = false): Promise<DTOTaskGroup[]> {
    // this.logger.logDebug('GETGROUPS LOCKING', new Date().toISOString());

    await this.lockLocalStorage(alreadyLocked, 'getGroups');

    /*if (alreadyLocked === false) {
      this.logger.logDebug('GETCALENDARTASKS LOCKED', new Date().toISOString());
    }*/

    LocalStorageService.LastUsedDatabaseReason = 'getGroups' + (new Date()).toISOString();

    try {
      const groups = await this.getGroupsFromDatabase();
      // console.log('GOT GROUPS : ', groups);

      // TODO : Temporary, remove
      const oops = groups.filter(p => p.Void == null);
      oops.forEach(p => p.Void = false);
      return groups; // groups.filter(p => p.Void === false);
    } catch (error) {
      this.logger.logError(new Error('unable to read from local database getGroups ' + error));
      alert('unable to read from local database 10');
      return [];
    } finally {
      /*if (alreadyLocked === false) {
        this.logger.logDebug('GETCALENDARTASKS UNLOCKING', new Date().toISOString());
        this.logger.logDebug('GETCALENDARTASKS ALREADY LOCKED', String(alreadyLocked));
      }*/

      this.unlockLocalStorage(alreadyLocked);

      /*if (alreadyLocked === false) {
        this.logger.logDebug('GETGROUPS UNLOCKED', new Date().toISOString());
      }*/
    }
  }

  private async getGroupsFromDatabase(): Promise<DTOTaskGroup[]> {
    // this.logger.logDebug('getCalendarTasksFromDatabase', LocalStorageService.CALENDAR_TASK_KEY);
    if (LocalStorageService.GROUPS_KEY == null) {
      return [];
    }

    // this.logger.logDebug('getCalendarTasksFromDatabase2', LocalStorageService.CALENDAR_TASK_KEY, new Date().toISOString());

    //await this.storage.ready;

    // this.logger.logDebug('isReady', LocalStorageService.CALENDAR_TASK_KEY, new Date().toISOString());

    const tasks = await this.storage.get(LocalStorageService.GROUPS_KEY);
    if (tasks == null) {
      // console.log('Tasks is null');
      return [];
    }
    // this.logger.logDebug('gotCalendarTasksFromDatabase TASKS', new Date().toISOString());
    const allGroups = tasks.map(p => DTOTaskGroup.fromAny(p));
    // console.log('ALLGROUPS FROMDATABASE', allGroups);
    // this.logger.logDebug('gotCalendarTasksFromDatabase', new Date().toISOString());
    return allGroups;
  }

  public async setGroups(groups: DTOTaskGroup[],
                         alreadyReadOnly: boolean = false): Promise<boolean> {
    // this.logger.logDebug('setCalendarTasks');
    await this.lockLocalStorage(alreadyReadOnly, 'setGroups');
    LocalStorageService.LastUsedDatabaseReason = 'setGroups ' + (new Date()).toISOString();

    try {
      await this.setGroupsToDatabase(groups);

      return true;
    } catch (error) {
      this.logger.logError(new Error('unable to read from local database 6767'), error);
      alert('unable to read from local database 11');

      return false;
    } finally {
      this.unlockLocalStorage(alreadyReadOnly);
      // this.logger.logDebug('SET CALENDAR TASKS COMPLETED');
    }
  }

  public async setGroupsAndTasks(groups: DTOTaskGroup[],
                                 tasks: DTOCalendarTask[]): Promise<boolean> {
    // this.logger.logDebug('setCalendarTasks');
    await this.lockLocalStorage(false, 'setGroupsAndTasks');
    LocalStorageService.LastUsedDatabaseReason = 'setGroupsAndTasks ' + (new Date()).toISOString();

    try {
      await this.setGroups(groups, true);
      await this.setCalendarTasks(tasks, true);

      return true;
    } catch (error) {
      this.logger.logError(new Error('unable to read from local database 6768'), error);
      alert('unable to read from local database 65');

      return false;
    } finally {
      this.unlockLocalStorage(false);
      // this.logger.logDebug('SET CALENDAR TASKS COMPLETED');
    }
  }

  private async setGroupsToDatabase(groups: DTOTaskGroup[]): Promise<void> {
    // console.log('setGroupsToDatabase', groups);
    //await this.storage.ready;
    await this.storage.set(LocalStorageService.GROUPS_KEY, groups);
    return;
  }

  // TODO: Do Generic method is is the same as timer
  public async insertGroup(group: DTOTaskGroup): Promise<void> {
    // console.log('INSERTING GROUP LOCAL STORAGE', group);
    await this.lockLocalStorage(false, 'setGroup');
    LocalStorageService.LastUsedDatabaseReason = 'setGroup ' + (new Date()).toISOString();

    try {
      const groups = await this.getGroups(true);
      groups.push(group);
      await this.setGroups(groups, true);
      return;
    } catch (error) {
      // console.error('error');
      this.logger.logError(new Error('unable to set group in local database'));
      alert('unable to read from local database 12');
      return null;
    } finally {
      this.unlockLocalStorage(false);
    }
  }

  public async updateGroup(group: DTOTaskGroup, alreadyLocked: boolean = false): Promise<void> {
    // console.log('UPDATING GROUP LOCAL STORAGE', group);

    if (alreadyLocked === false) {
      await this.lockLocalStorage(false, 'setGroup');
      LocalStorageService.LastUsedDatabaseReason = 'setGroup ' + (new Date()).toISOString();
    }

    try {
      const groups = await this.getGroups(true);
      const index = groups.findIndex(p => p.GroupId === group.GroupId);
      groups[index] = group;
      await this.setGroups(groups, true);
      return;
    } catch (error) {
      // console.error('error');
      this.logger.logError(new Error('unable to set group in local database'));
      alert('unable to read from local database 13');
      return null;
    } finally {
      if (alreadyLocked === false) {
        this.unlockLocalStorage(false);
      }
    }
  }

  private unlockLocalStorage(alreadyLocked: boolean): void {
    if (alreadyLocked === false) {
      // console.log('[UNLOCK]');
      LocalStorageService.currentlyUsed = false;
    }
  }

  private async lockLocalStorage(alreadyLocked: boolean, reason: string): Promise<void> {
    if (alreadyLocked === false) {
      // console.log('[ATTEMPTING LOCK]');
      await this.waitForDbAvailable('lockLocalStorage ' + reason);
      // console.log('[LOCK SUCCESSFUL]');
      LocalStorageService.currentlyUsed = true;
      return;
    }

    return;
  }

  public async waitForDbAvailable(reason: string): Promise<void> {
    if (LocalStorageService.currentlyUsed === true || LocalStorageService.CALENDAR_TASK_KEY == null) {
      for (let i = 0; i < 30; i++) {
        /*console.log('----- CURRENTLY USED BY ' + LocalStorageService.LastUsedDatabaseReason + ', FOR ' +
                    reason + ' WAITING, CURRENT DATE = ', new Date().toISOString());*/
        await ThreadUtils.sleep(1000);
        if (this.dbAvailable()) {
          this.logger.logDebug('available after i=', i.toString());
          return;
        }
      }

      this.logger.logError(new Error('database is locked'), { key: 'reason', value: LocalStorageService.LastUsedDatabaseReason });
      alert(this.translate.instant('local-storage.database-locked'));
      throw new DatabaseLockedError('database is locked');
    } else {
      // console.log('CURRENTLY NOT USED, RETURNING');
      return;
    }
  }

  private dbAvailable() {
    return LocalStorageService.currentlyUsed === false;
  }
}
