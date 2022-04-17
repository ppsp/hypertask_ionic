import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { TranslateService } from '@ngx-translate/core';
import { ILocalStorageService } from '../interfaces/i-local-storage-service';
import { ILogger } from '../interfaces/i-logger';
import { Storage } from '@ionic/storage';
import { DTOCalendarTask } from '../models/DTO/dto-calendar-task';
import { DTOTaskGroup } from '../models/DTO/dto-task-group';
import { DTOTaskHistory } from '../models/DTO/dto-task-history';
import { DTOTaskTimer } from '../models/DTO/dto-timer';
import { DTOUser } from '../models/DTO/dto-user';
import { DTOUserConfig } from '../models/DTO/dto-user-config';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class SqliteService implements ILocalStorageService {

  public static currentlyUsed: boolean = false;
  // TODO: Use non-static variable. For now it's assignation gets lost because of scoping issues
  public static LAST_READ_CHANGELOG_VERSION_KEY: string = 'lastReadChangelogVersion';
  public static USER_KEY: string = 'user';
  public static LastUsedDatabaseReason: string;

  private static database: SQLiteObject;
  public Initialized: boolean = false;
  private isMobile: boolean;

  constructor(private sqlite: SQLite,
              private storage: Storage,
              private logger: ILogger,
              private translate: TranslateService,
              private platform: Platform) {

  }

  public waitForDbAvailable(reason: string): Promise<void> {
    // throw new Error('Method not implemented.');
    return;
  }

  public async initialize(userId: string): Promise<void> {
    // console.log('initialize SQLite');
    this.isMobile = this.platform.is('cordova');
    if (this.isMobile) {
      // console.log('ISmOBILE');
      await this.platform.ready();
      // console.log('platform ready');
      try {
        const db = await this.sqlite.create({
          name: 'hypertask_' + userId + '.db',
          location: 'default'
        });
        SqliteService.database = db;
        // console.log('this.database:', SqliteService.database);

        /*await SqliteService.database.executeSql(`DROP TABLE IF EXISTS task_group;`, []);
        await SqliteService.database.executeSql(`DROP TABLE IF EXISTS task_history;`, []);
        await SqliteService.database.executeSql(`DROP TABLE IF EXISTS user;`, []);
        await SqliteService.database.executeSql(`DROP TABLE IF EXISTS task_todo;`, []);
        await SqliteService.database.executeSql(`DROP TABLE IF EXISTS task_timer;`, []);*/

        SqliteService.currentlyUsed = true;

        const result01 = await SqliteService.database.executeSql(`CREATE TABLE IF NOT EXISTS task_group (
                              "GROUP_ID" TEXT NOT NULL,
                              "TASK_GROUP_DATA"	TEXT NOT NULL,
                              PRIMARY KEY("GROUP_ID")
                            );`, []).catch(err => {
                              console.log('error11 sql:', JSON.stringify(err));
                            });
        /*const result02 = await SqliteService.database.executeSql(`CREATE TABLE IF NOT EXISTS task_history (
                              "TASK_HISTORY_ID"	TEXT NOT NULL,
                              "CALENDAR_TASK_ID" TEXT NOT NULL,
                              "TASK_HISTORY_DATA"	TEXT NOT NULL,
                              PRIMARY KEY("TASK_HISTORY_ID")
                            );`, []).catch(err => {
                              console.log('error12 sql:', JSON.stringify(err));
                            });*/
        const result03 = await SqliteService.database.executeSql(`CREATE TABLE IF NOT EXISTS task_todo (
                              "CALENDAR_TASK_ID" TEXT NOT NULL,
                              "CALENDAR_TASK_DATA" TEXT NOT NULL,
                              PRIMARY KEY("CALENDAR_TASK_ID")
                            );`, []).catch(err => {
                              console.log('error13 sql:', JSON.stringify(err));
                            });
        const result04 = await SqliteService.database.executeSql(`CREATE TABLE IF NOT EXISTS task_timer (
                              TIMER_ID	TEXT,
                              TIMER_DATA	TEXT,
                              PRIMARY KEY("TIMER_ID")
                            );`, []).catch(err => {
                              console.log('error14 sql:', JSON.stringify(err));
                            });
        const result05 = await SqliteService.database.executeSql(`CREATE TABLE IF NOT EXISTS user (
                              "USER_ID"	INTEGER NOT NULL,
                              "USER_DATA"	TEXT NOT NULL,
                              PRIMARY KEY("USER_ID")
                            );`, []).catch(err => {
                              console.log('error15 sql:', JSON.stringify(err));
                            });

        /*console.log('result01', JSON.stringify(result01));
        console.log('result02', JSON.stringify(result02));
        console.log('result03', JSON.stringify(result03));
        console.log('result04', JSON.stringify(result04));
        console.log('result05', JSON.stringify(result05));*/

        // tslint:disable-next-line:max-line-length
        /*const result = await SqliteService.database.executeSql(`CREATE TABLE IF NOT EXISTS task_timer (TIMER_ID	TEXT PRIMARY KEY,TIMER_DATA TEXT);`, []).catch(err => {
          console.log('error sql:', err);
        });*/

        //console.log('Executed SQL, testing select');

        /*const result2 = await SqliteService.database.executeSql(`SELECT * FROM task_group`, []).catch(err => {
          console.log('error1 sql:', JSON.stringify(err));
        });
        const result4 = await SqliteService.database.executeSql(`SELECT * FROM task_todo`, []).catch(err => {
          console.log('error3 sql:', JSON.stringify(err));
        });
        const result5 = await SqliteService.database.executeSql(`SELECT * FROM task_timer`, []).catch(err => {
          console.log('error4 sql:', JSON.stringify(err));
        });
        const result6 = await SqliteService.database.executeSql(`SELECT * FROM user`, []).catch(err => {
          console.log('error5 sql:', JSON.stringify(err));
        });
        console.log('result2', JSON.stringify(result2));
        // console.log('result3', JSON.stringify(result3));
        console.log('result4', JSON.stringify(result4));
        console.log('result5', JSON.stringify(result5));
        console.log('result6', JSON.stringify(result6));

        const result22 = await SqliteService.database.executeSql(`PRAGMA table_info(task_group);`, []).catch(err => {
          console.log('error21 sql:', JSON.stringify(err));
        });
        const result24 = await SqliteService.database.executeSql(`PRAGMA table_info(task_todo);`, []).catch(err => {
          console.log('error23 sql:', JSON.stringify(err));
        });
        const result25 = await SqliteService.database.executeSql(`PRAGMA table_info(task_timer);`, []).catch(err => {
          console.log('error24 sql:', JSON.stringify(err));
        });
        const result26 = await SqliteService.database.executeSql(`PRAGMA table_info(user);`, []).catch(err => {
          console.log('error25 sql:', JSON.stringify(err));
        });
        console.log('result22', JSON.stringify(result22.rows.item(0)));
        console.log('result22', JSON.stringify(result22.rows.item(1)));
        console.log('result24', JSON.stringify(result24.rows.item(0)));
        console.log('result24', JSON.stringify(result24.rows.item(1)));
        console.log('result25', JSON.stringify(result25.rows.item(0)));
        console.log('result25', JSON.stringify(result25.rows.item(1)));
        console.log('result26', JSON.stringify(result26.rows.item(0)));
        console.log('result26', JSON.stringify(result26.rows.item(1)));*/

        this.Initialized = true;
        SqliteService.currentlyUsed = false;
        console.log('Executed SQL7, isInitialized = true');
      } catch (error) {
        console.error('Error executing initialize7', error);
        console.log(error);
        this.logger.logError(new Error('Error initializing database'));
      }
    }
  }

  async terminate(): Promise<void> {
    // await this.waitForDbAvailable('terminate');
    this.Initialized = false;
  }

  setCalendarTasks(tasks: DTOCalendarTask[], alreadyUsed: boolean): Promise<boolean> {
    // DONT NEED ANYMORE
    throw new Error('Method not implemented.');
  }

  public async getCalendarTasks(alreadyUsed: boolean): Promise<DTOCalendarTask[]> {
    // console.log('getCalendarTasks', new Date());
    const query = 'SELECT * FROM task_todo';
    const data = await SqliteService.database.executeSql(query, []);
    // console.log('getCalendarTasks got data', new Date());
    const tasks: DTOCalendarTask[] = [];
    if (data.rows.length > 0) {
      for (let i = 0; i < data.rows.length; i++) {
        // console.log('item:', data.rows.item(i));
        tasks.push(JSON.parse(data.rows.item(i).CALENDAR_TASK_DATA));
      }
    }

    // console.log('ALLTASKS HISTORIES:' + JSON.stringify(tasks[0].Histories));

    // console.log('getCalendarTasks got data 2', new Date());

    // console.log('tasks: ', JSON.stringify(tasks));

    /*const query2 = 'SELECT * FROM task_history'; // TODO : UserID ?
    const data2 = await SqliteService.database.executeSql(query2, []);

    console.log('getCalendarTasks got data 3', new Date());

    const Histories: DTOTaskHistory[] = [];
    if (data2.rows.length > 0) {
      for (let i = 0; i < data2.rows.length; i++) {
        // console.log('item:', data2.rows.item(i));
        Histories.push(JSON.parse(data2.rows.item(i).TASK_HISTORY_DATA));
      }
    }*/

    /*const tasksDict = tasks.reduce((a, x) => ({...a, [x.CalendarTaskId]: x}), {});

    for (const history of Histories) {
      // console.log('history', history);
      tasksDict[history.CalendarTaskId].Histories.push(history);
    }*/

    // console.log('getCalendarTasks got data 6', new Date());

    // console.log('histories: ', JSON.stringify(Histories));
    // console.log('tasks2: ', JSON.stringify(tasks));
    return tasks;
  }

  async insertCalendarTask(task: DTOCalendarTask): Promise<void> {
    // console.log('insertCalendarTask');
    // task.Histories = [];
    const data = [task.CalendarTaskId, JSON.stringify(task)];
    // console.log('insertCalendarTask2 data', data);
    await SqliteService.database.executeSql('INSERT INTO task_todo (CALENDAR_TASK_ID,CALENDAR_TASK_DATA) VALUES (?, ?)', data);
  }

  async insertCalendarTasks(tasks: DTOCalendarTask[]): Promise<any> {
    // console.log('insertCalendarTasks');
    for (const task of tasks) {
      // task.Histories = [];
      await this.insertCalendarTask(task);
    }
  }

  async updateCalendarTask(task: DTOCalendarTask, synced: boolean): Promise<any> {
    // task.Histories = [];
    const data = [JSON.stringify(task), task.CalendarTaskId];
    // console.log('updateCalendarTask data', data);
    await SqliteService.database.executeSql('UPDATE task_todo SET CALENDAR_TASK_DATA = ? WHERE CALENDAR_TASK_ID = ?', data);
  }

  async updateCalendarTasks(tasks: DTOCalendarTask[], synced: boolean): Promise<any> {
    // console.log('updateCalendarTask');
    for (const task of tasks) {
      // task.Histories = [];
      await this.updateCalendarTask(task, synced);
    }
  }

  async updateSyncedCalendarTask(task: DTOCalendarTask, alreadyLocked: boolean): Promise<any> {
    console.log('updateSyncedCalendarTask');
    // throw new Error('Method not implemented.');
    // ??
  }

  async insertTaskHistory(history: DTOTaskHistory): Promise<any> {
    console.log('insertTaskHistory, might have to do sync stuff', history);
    /*const data = [history.TaskHistoryId, JSON.stringify(history), history.CalendarTaskId];
    // tslint:disable-next-line:max-line-length
    await SqliteService.database.executeSql('INSERT INTO task_history (TASK_HISTORY_ID,TASK_HISTORY_DATA,CALENDAR_TASK_ID) VALUES (?, ?, ?)', data);*/
    const task = await this.getCalendarTask(history.CalendarTaskId);
    // console.log('task', task);
    task.Histories.push(history);
    await this.updateCalendarTask(task, false);
  }

  async getCalendarTask(calendarTaskId: string): Promise<DTOCalendarTask> {
    const query = `SELECT * FROM task_todo where CALENDAR_TASK_ID = '${ calendarTaskId }'`;
    const data = await SqliteService.database.executeSql(query, []);
    // console.log('getCalendarTasks got data', new Date());
    if (data.rows.length > 0) {
      return JSON.parse(data.rows.item(0).CALENDAR_TASK_DATA);
    } else {
      return null;
    }
  }

  async insertTaskHistories(histories: DTOTaskHistory[]): Promise<any> {
    console.log('insertTaskHistories');
    for (const history of histories) {
      await this.insertTaskHistory(history);
    }
  }

  async updateTaskHistory(history: DTOTaskHistory): Promise<any> {
    //console.log('updateTaskHistory', history);
    /*const data = [JSON.stringify(history), history.CalendarTaskId, history.TaskHistoryId];
    // tslint:disable-next-line:max-line-length
    await SqliteService.database.executeSql('UPDATE task_history SET TASK_HISTORY_DATA = ?, CALENDAR_TASK_ID = ? WHERE TASK_HISTORY_ID = ?', data);*/

    const task = await this.getCalendarTask(history.CalendarTaskId);
    const historyIndex = task.Histories.findIndex(p => p.TaskHistoryId === history.TaskHistoryId); // TODO: USE MAP ?
    if (historyIndex === -1) {
      this.logger.logError(new Error('Unable to find task history while setting as synced3'),
                           {
                             key: 'task.Histories',
                             value: JSON.stringify(task.Histories)
                           });
      this.logger.logError(new Error('Unable to find task history while setting as synced4'),
                           {
                             key: 'newHistoryId',
                             value: JSON.stringify(history.TaskHistoryId)
                           });
    } else {
      task.Histories[historyIndex] = history;
      await this.updateCalendarTask(task, false);
    }
  }

  async updateTaskHistories(histories: DTOTaskHistory[]): Promise<any> {
    // console.log('updateTaskHistories');
    for (const history of histories) {
      await this.updateTaskHistory(history);
    }
  }

  public async updateSyncedTaskHistory(history: DTOTaskHistory, alreadyLocked: boolean): Promise<any> {
    // this.logger.logDebug('lock (updateSyncedTaskHistory)');
    try {
      // if (alreadySynced === false) {
      SqliteService.currentlyUsed = true;
      SqliteService.LastUsedDatabaseReason = 'updateSyncedTaskHistory' + (new Date()).toISOString();
      // }

      await this.updateTaskHistory(history);

      return;
    } catch (error) {
      this.logger.logError(new Error('unable to read from local database updateSyncedTaskHistory19 ' + error));
      alert('unable to read from local database 98');
      return;
    }
    // ??
  }

  async clear(): Promise<void> {
    await SqliteService.database.executeSql(`DELETE FROM task_group`, []);
    await SqliteService.database.executeSql(`DELETE FROM user`, []);
    await SqliteService.database.executeSql(`DELETE FROM task_todo`, []);
    await SqliteService.database.executeSql(`DELETE FROM task_timer`, []);
    console.log('deleted all');

    /*const result2 = await SqliteService.database.executeSql(`SELECT * FROM task_group`, []).catch(err => {
      console.log('error1 sql:', JSON.stringify(err));
    });
    const result4 = await SqliteService.database.executeSql(`SELECT * FROM task_todo`, []).catch(err => {
      console.log('error3 sql:', JSON.stringify(err));
    });
    const result5 = await SqliteService.database.executeSql(`SELECT * FROM task_timer`, []).catch(err => {
      console.log('error4 sql:', JSON.stringify(err));
    });
    const result6 = await SqliteService.database.executeSql(`SELECT * FROM user`, []).catch(err => {
      console.log('error5 sql:', JSON.stringify(err));
    });
    console.log('result2', JSON.stringify(result2));
    console.log('result4', JSON.stringify(result4));
    console.log('result5', JSON.stringify(result5));
    console.log('result6', JSON.stringify(result6));*/
  }

  public async shouldViewChangeLog(currentVersion: string): Promise<boolean> {
    //await this.storage.ready;
    const lastReadVersion = await this.storage.get(SqliteService.LAST_READ_CHANGELOG_VERSION_KEY);

    if (lastReadVersion != null) {
      if (lastReadVersion !== currentVersion) {
        return true;
      } else {
        return false;
      }
    } else {
      this.storage.set(SqliteService.LAST_READ_CHANGELOG_VERSION_KEY, currentVersion);
      return false;
    }
  }

  public async setChangeLogToViewed(currentVersion: string): Promise<boolean> {
    await this.storage.set(SqliteService.LAST_READ_CHANGELOG_VERSION_KEY, currentVersion);
    return true;
  }

  public async getUser(userId: string): Promise<DTOUser> {
    //console.log('getUser');
    // console.log('getting user from local (awaiting)');
    // await this.lockLocalStorage(false, 'getUser');
    // console.log('getting user from local');
    SqliteService.LastUsedDatabaseReason = 'getUser ' + (new Date()).toISOString();

    try {
      const user = await this.storage.get(SqliteService.USER_KEY + userId) as DTOUser;

      //console.log('gotUser');
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
    } /*finally {
      this.unlockLocalStorage(false);
    }*/
  }

  public async setUser(user: DTOUser, alreadyLocked: boolean = false): Promise<void> {
    //console.log('setUser');
    // await this.lockLocalStorage(alreadyLocked, 'setUser');
    SqliteService.LastUsedDatabaseReason = 'setUser ' + (new Date()).toISOString();

    try {
      // console.log('SETTING USER LOCALLY : ', user);
      //await this.storage.ready();
      await this.storage.set(SqliteService.USER_KEY + user.UserId, user);
      return;
    } catch (error) {
      // console.error('error');
      this.logger.logError(new Error('unable to set user in local database'));
      alert('unable to set user in local database');
      return null;
    } /*finally {
      this.unlockLocalStorage(false);
    }*/
  }

  public async getTimers(alreadyReadOnly: boolean): Promise<DTOTaskTimer[]> {
    //console.log('getTimers');
    // await this.waitForDbAvailable('getTimers');
    const query = 'SELECT * FROM task_timer';
    //console.log('this.database2:', SqliteService.database);
    const data = await SqliteService.database.executeSql(query, []);
    const timers: DTOTaskTimer[] = [];
    if (data.rows.length > 0) {
      for (let i = 0; i < data.rows.length; i++) {
        // console.log('item timer:', data.rows.item(i));
        timers.push(JSON.parse(data.rows.item(i).TIMER_DATA));
      }
    }

    //console.log('timers: ', timers);
    return timers;
  }

  public async setTimers(timers: DTOTaskTimer[], alreadyReadOnly: boolean): Promise<void> {
    //console.log('SET TIMERS');
    for (const timer of timers) {
      await this.insertTimer(timer);
    }
  }

  public async insertTimer(timer: DTOTaskTimer): Promise<void> {
    //console.log('insertTimer');
    const data = [timer.TimerId, JSON.stringify(timer)];
    await SqliteService.database.executeSql('INSERT INTO task_timer (TIMER_ID,TIMER_DATA) VALUES (?, ?)', data);
  }

  public async updateTimer(timer: DTOTaskTimer): Promise<void> {
    //console.log('updateTimer');
    const data = [JSON.stringify(timer), timer.TimerId];
    await SqliteService.database.executeSql('UPDATE task_timer set TIMER_DATA = ? WHERE TIMER_ID = ?', data);
  }

  public async getGroups(alreadyLocked: boolean): Promise<DTOTaskGroup[]> {
    //console.log('getGroups');
    const query = 'SELECT * FROM task_group';
    const data = await SqliteService.database.executeSql(query, []);
    const groups: DTOTaskGroup[] = [];
    if (data.rows.length > 0) {
      for (let i = 0; i < data.rows.length; i++) {
        groups.push(JSON.parse(data.rows.item(i).TASK_GROUP_DATA));
      }
    }

    //console.log('groups: ', groups);
    return groups;
  }

  public async setGroups(groups: DTOTaskGroup[], alreadyReadOnly: boolean): Promise<boolean> {
    // console.log('Settings groups');
    await this.insertGroups(groups);
    return true;
  }

  public async setGroupsAndTasks(groups: DTOTaskGroup[], tasks: DTOCalendarTask[]): Promise<boolean> {
    // console.log('setGroupsAndTasks', groups, tasks);
    // throw new Error('Method not implemented.');
    // remove this
    await this.insertGroups(groups);
    await this.insertCalendarTasks(tasks);
    return true;
  }

  public async insertGroup(group: DTOTaskGroup): Promise<void> {
    // console.log('insertGroup');
    const data = [group.GroupId, JSON.stringify(group)];
    await SqliteService.database.executeSql('INSERT INTO task_group (GROUP_ID,TASK_GROUP_DATA) VALUES (?, ?)', data);
  }

  public async insertGroups(groups: DTOTaskGroup[]): Promise<void> {
    // console.log('insertGroups');
    for (const group of groups) {
      await this.insertGroup(group);
    }
  }

  public async updateGroup(group: DTOTaskGroup, alreadyLocked: boolean): Promise<void> {
    // console.log('updateGroup');
    const data = [JSON.stringify(group), group.GroupId];
    await SqliteService.database.executeSql('UPDATE task_group set TASK_GROUP_DATA = ? WHERE GROUP_ID = ?', data);
  }

  public async updateGroups(groups: DTOTaskGroup[], alreadyLocked: boolean): Promise<void> {
    for (const group of groups) {
      await this.updateGroup(group, alreadyLocked);
    }
  }

  public async updateSyncedGroup(group: DTOTaskGroup): Promise<any> {
    try {
      await this.updateGroup(group, false);
      // this.logger.logDebug('## updateSyncedTaskHistory SET CALENDAR TASKS');
      return;
    } catch (error) {
      this.logger.logError(new Error('unable to read from local database updateSyncedTaskHistory1 ' + error));
      alert('unable to read from local database 9');
      return;
    }
  }

  /*private unlockLocalStorage(alreadyLocked: boolean): void {
    if (alreadyLocked === false) {
      // console.log('[UNLOCK]');
      SqliteService.currentlyUsed = false;
    }Unable to find task history while setting as syncedUnable to find task history while setting as synced
  }

  private async lockLocalStorage(alreadyLocked: boolean, reason: string): Promise<void> {
    if (alreadyLocked === false) {
      console.log('[ATTEMPTING LOCK]', reason);
      await this.waitForDbAvailable('lockLocalStorage ' + reason);
      // console.log('[LOCK SUCCESSFUL]');
      SqliteService.currentlyUsed = true;
      return;
    }

    return;
  }*/

  /*public async waitForDbAvailable(reason: string): Promise<void> {
    if (SqliteService.currentlyUsed === true) {
      for (let i = 0; i < 30; i++) {
        // console.log('----- CURRENTLY USED BY ' + SqliteService.LastUsedDatabaseReason + ', FOR ' +
        //         reason + ' WAITING, CURRENT DATE = ', new Date().toISOString());
        await ThreadUtils.sleep(1000);
        if (this.dbAvailable()) {
          this.logger.logDebug('available after i=', i.toString());
          return;
        }
      }

      this.logger.logError(new Error('database is locked'), { key: 'reason', value: SqliteService.LastUsedDatabaseReason });
      alert(this.translate.instant('local-storage.database-locked'));
      throw new DatabaseLockedError('database is locked');
    } else {
      // console.log('CURRENTLY NOT USED, RETURNING');
      return;
    }
  }*/

  /*private dbAvailable() {
    return SqliteService.currentlyUsed === false;
  }*/
}
