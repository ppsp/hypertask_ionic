import { Injectable } from '@angular/core';
import { DTOCalendarTask } from 'src/app/models/DTO/dto-calendar-task';
import { ILocalStorageService } from 'src/app/interfaces/i-local-storage-service';
import { DTOTaskHistory } from 'src/app/models/DTO/dto-task-history';
import { DatabaseLockedError } from 'src/app/models/Exceptions/DatabaseLockedError';
import { ILogger } from 'src/app/interfaces/i-logger';
import { DTOUser } from 'src/app/models/DTO/dto-user';
import { DTOTaskTimer } from 'src/app/models/DTO/dto-timer';
import { DTOTaskGroup } from 'src/app/models/DTO/dto-task-group';

@Injectable()
export class LocalStorageMockService implements ILocalStorageService {

  public static currentlyUsed: boolean = false;
  public Initialized: boolean = false;
  private calendarTasks: DTOCalendarTask[] = [];
  private users: DTOUser[] = [];
  private timers: DTOTaskTimer[] = [];
  private groups: DTOTaskGroup[] = [];

  constructor() { }

  public async insertCalendarTasks(tasks: DTOCalendarTask[]): Promise<any> {
    await this.waitForDbAvailable();
    LocalStorageMockService.currentlyUsed = true;
    const localTasks = await this.getCalendarTasks(true);
    tasks.forEach(p => tasks.push(p));
    await this.setCalendarTasks(tasks, true);
    LocalStorageMockService.currentlyUsed = false;
    return;
  }

  public async insertTaskHistories(histories: DTOTaskHistory[]): Promise<any> {
    // console.log('inserting history locally', history);
    await this.waitForDbAvailable();
    LocalStorageMockService.currentlyUsed = true;
    const tasks = await this.getCalendarTasks(true);
    for (const history of histories) {
      const task = tasks.filter(p => p.CalendarTaskId === history.CalendarTaskId)[0];
      task.Histories.push(history);
    }
    await this.setCalendarTasks(tasks, true);
    LocalStorageMockService.currentlyUsed = false;
    return;
  }

  public async updateTaskHistories(histories: DTOTaskHistory[]): Promise<any> {
    // console.log('updating history locally', history);
    await this.waitForDbAvailable();
    LocalStorageMockService.currentlyUsed = true;
    histories.forEach(p => p.Synced = false);
    const tasks = await this.getCalendarTasks(true);
    for (const history of histories) {
      const task = tasks.filter(p => p.CalendarTaskId === history.CalendarTaskId)[0];
      const index = task.Histories.findIndex(p => p.TaskHistoryId === history.TaskHistoryId);
      task.Histories[index] = history;
    }
    await this.setCalendarTasks(tasks, true);
    LocalStorageMockService.currentlyUsed = false;
    return;
  }

  public async insertGroups(groups: DTOTaskGroup[]): Promise<void> {
    groups.forEach(p => this.groups.push(p));
  }

  public async updateGroups(groups: DTOTaskGroup[], alreadyLocked: boolean): Promise<void> {
    for (const group of groups) {
      const index = this.groups.findIndex(p => p.GroupId === group.GroupId);
      this.groups[index] = group;
    }
  }

  public async initialize(): Promise<void> {
    return;
  }

  public async terminate(): Promise<void> {
    this.calendarTasks = [];
  }

  public async setCalendarTasks(tasks: DTOCalendarTask[],
                                alreadyUsed: boolean = false): Promise<boolean> {
    if (alreadyUsed === false) {
      await this.waitForDbAvailable();
      LocalStorageMockService.currentlyUsed = true;
    }

    try {
      this.calendarTasks = tasks;

      return true;
    } catch (error) {
      return false;
    } finally {
      if (alreadyUsed === false) {
        LocalStorageMockService.currentlyUsed = false;
      }
    }
  }

  public async getCalendarTasks(alreadyUsed: boolean = false): Promise<DTOCalendarTask[]> {
    if (alreadyUsed === false) {
      await this.waitForDbAvailable();
      LocalStorageMockService.currentlyUsed = true;
    }

    try {
      const tasks = this.calendarTasks;
      const allTasks = tasks.map(p => DTOCalendarTask.fromAny(p));

      return allTasks;
    } catch (error) {
      //this.logger.logError(new Error('unable to read from local database getCalendarTasks 2 mock'));
      return [];
    } finally {
      if (alreadyUsed === false) {
        LocalStorageMockService.currentlyUsed = false;
      }
    }
  }

  public async insertCalendarTask(task: DTOCalendarTask): Promise<any> {
    // console.log('inserting task locally', task);
    await this.waitForDbAvailable();
    LocalStorageMockService.currentlyUsed = true;
    const tasks = await this.getCalendarTasks(true);
    tasks.push(task);
    await this.setCalendarTasks(tasks, true);
    LocalStorageMockService.currentlyUsed = false;
    return;
  }

  public async updateCalendarTask(task: DTOCalendarTask): Promise<any> {
    // console.log('inserting task locally', task);
    await this.waitForDbAvailable();
    LocalStorageMockService.currentlyUsed = true;
    task.Synced = false;
    const tasks = await this.getCalendarTasks(true);
    const index = tasks.findIndex(p => p.CalendarTaskId === task.CalendarTaskId);
    tasks[index] = task;
    await this.setCalendarTasks(tasks, true);
    LocalStorageMockService.currentlyUsed = false;
    return;
  }

  public async updateCalendarTasks(tasks: DTOCalendarTask[], synced: boolean): Promise<any> {
    await this.waitForDbAvailable();
    LocalStorageMockService.currentlyUsed = true;
    tasks.forEach(p => p.Synced = synced);
    const allTasks = await this.getCalendarTasks(true);
    for (const task of tasks) {
      const index = allTasks.findIndex(p => p.CalendarTaskId === task.CalendarTaskId);
      allTasks[index] = task;
    }

    await this.setCalendarTasks(allTasks, true);
    LocalStorageMockService.currentlyUsed = false;
    return;
  }

  public async updateSyncedCalendarTask(task: DTOCalendarTask): Promise<any> {
    // console.log('inserting task locally', task);
    await this.waitForDbAvailable();
    LocalStorageMockService.currentlyUsed = true;
    const tasks = await this.getCalendarTasks(true);
    const index = tasks.findIndex(p => p.CalendarTaskId === task.CalendarTaskId);
    tasks[index] = task;
    await this.setCalendarTasks(tasks, true);
    LocalStorageMockService.currentlyUsed = false;
    return;
  }

  public async insertTaskHistory(history: DTOTaskHistory): Promise<any> {
    // console.log('inserting history locally', history);
    await this.waitForDbAvailable();
    LocalStorageMockService.currentlyUsed = true;
    const tasks = await this.getCalendarTasks(true);
    const task = tasks.filter(p => p.CalendarTaskId === history.CalendarTaskId)[0];
    task.Histories.push(history);
    await this.setCalendarTasks(tasks, true);
    LocalStorageMockService.currentlyUsed = false;
    return;
  }

  public async updateTaskHistory(history: DTOTaskHistory): Promise<any> {
    // console.log('updating history locally', history);
    await this.waitForDbAvailable();
    LocalStorageMockService.currentlyUsed = true;
    history.Synced = false;
    const tasks = await this.getCalendarTasks(true);
    const task = tasks.filter(p => p.CalendarTaskId === history.CalendarTaskId)[0];
    const index = task.Histories.findIndex(p => p.TaskHistoryId === history.TaskHistoryId);
    task.Histories[index] = history;
    await this.setCalendarTasks(tasks, true);
    LocalStorageMockService.currentlyUsed = false;
    return;
  }

  public async updateSyncedTaskHistory(history: DTOTaskHistory): Promise<any> {
    // console.log('updating history locally', history);
    await this.waitForDbAvailable();
    LocalStorageMockService.currentlyUsed = true;
    const tasks = await this.getCalendarTasks(true);
    const task = tasks.filter(p => p.CalendarTaskId === history.CalendarTaskId)[0];
    const index = task.Histories.findIndex(p => p.TaskHistoryId === history.TaskHistoryId);
    task.Histories[index] = history;
    await this.setCalendarTasks(tasks, true);
    LocalStorageMockService.currentlyUsed = false;
    return;
  }

  public async allDataIsSynced() {
    const allTasks = await this.getCalendarTasks(false);
    const unsyncedData = allTasks.filter(p => p.Synced === false ||
                                              p.Sent === false ||
                                              p.Histories.some(t => t.Sent === false ||
                                                                    t.Synced === false));

    /*if (unsyncedData != null && unsyncedData.length > 0) {
      // console.log('unsynced data:', unsyncedData);
    } else {
      // console.log('no unsynced data:', unsyncedData);
    }*/

    return unsyncedData == null || unsyncedData.length === 0;
  }

  public async waitForDbAvailable(): Promise<void> {
    if (LocalStorageMockService.currentlyUsed === true) {
      for (let i = 0; i < 50; i++) {
        await this.sleep(1000);
        if (this.dbAvailable()) {
          return;
        }
      }

      //this.logger.logError(new Error('database is locked'));
      alert('database is locked');
      throw new DatabaseLockedError('database is locked');
    } else {
      return;
    }
  }

  private dbAvailable() {
    return LocalStorageMockService.currentlyUsed === false;
  }

  // Todo: move in utils
  private async sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public async clear(): Promise<void> {
    this.calendarTasks = [];
  }

  public async shouldViewChangeLog(currentVersion: string): Promise<boolean> {
    return true;
  }

  public async setChangeLogToViewed(currentVersion: string): Promise<boolean> {
    return true;
  }

  public async getUser(userId: string): Promise<DTOUser> {
    await this.lockLocalStorage(false);
    try {
      return this.users.filter(p => p.UserId === userId)[0];
    } catch (error) {
      //this.logger.logError(new Error('unable to read user from local database'));
      return null;
    } finally {
      this.unlockLocalStorage(false);
    }
  }

  public async setUser(user: DTOUser): Promise<void> {
    await this.lockLocalStorage(false);
    try {
      const index = this.users.findIndex(p => p.UserId === user.UserId);
      if (index === -1) {
       this.users.push(user);
      } else {
        this.users[index] = user;
      }
    } catch (error) {
      return;
    } finally {
      this.unlockLocalStorage(false);
    }
  }

  public async getTimers(): Promise<DTOTaskTimer[]> {
    return this.timers;
  }

  public async setTimers(timers: DTOTaskTimer[], alreadyReadOnly: boolean): Promise<void> {
    this.timers = timers;
  }

  public async insertTimer(timer: DTOTaskTimer): Promise<void> {
    this.timers.push(timer);
  }

  public async updateTimer(timer: DTOTaskTimer): Promise<void> {
    // TODO: not sure this is necessary
    const index = this.timers.findIndex(p => p.TimerId === timer.TimerId);
    this.timers[index] = timer;
  }

  public async getGroups(alreadyLocked: boolean): Promise<DTOTaskGroup[]> {
    return this.groups;
  }

  public async setGroups(groups: DTOTaskGroup[], alreadyReadOnly: boolean): Promise<boolean> {
    this.groups = groups;
    return true;
  }

  public async insertGroup(group: DTOTaskGroup): Promise<void> {
    this.groups.push(group);
  }

  public async updateGroup(group: DTOTaskGroup): Promise<void> {
    // TODO: not sure this is necessary
    const index = this.groups.findIndex(p => p.GroupId === group.GroupId);
    this.groups[index] = group;
  }

  public async updateSyncedGroup(group: DTOTaskGroup): Promise<any> {
    const index = this.groups.findIndex(p => p.GroupId === group.GroupId);
    this.groups[index] = group;
    return this.groups;
  }

  private unlockLocalStorage(alreadyLocked: boolean): void {
    if (alreadyLocked === false) {
      // console.log('unlock');
      LocalStorageMockService.currentlyUsed = false;
    }
  }

  private async lockLocalStorage(alreadyLocked: boolean) {
    if (alreadyLocked === false) {
      // console.log('attempting lock');
      await this.waitForDbAvailable();
      // console.log('lock successful');
      LocalStorageMockService.currentlyUsed = true;
    }
  }

  public checkForEventsRepeat(): Promise<void> {
    return;
  }

  public processQueue(): Promise<void> {
    return;
  }

  public async setGroupsAndTasks(groups: DTOTaskGroup[],
                                 tasks: DTOCalendarTask[]): Promise<boolean> {
    this.groups = groups;
    this.calendarTasks = tasks;
    return true;
  }
}
