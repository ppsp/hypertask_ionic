import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { DTOGetCalendarTaskRequest } from '../models/DTO/dto-get-calendar-task-request';
import { DTOCalendarTask } from '../models/DTO/dto-calendar-task';
import DateUtils from '../shared/date-utils';
import { CalendarTask } from '../models/Core/calendar-task';
import { CalendarTaskNotFoundError } from '../models/Exceptions/CalendarTaskNotFoundError';
import { IApiProvider } from '../interfaces/i-api-provider';
import { ILocalStorageService } from '../interfaces/i-local-storage-service';
import { StatType } from '../models/Core/custom-stat.enum';
import { TaskFrequency } from '../models/Core/task-frequency.enum';
import { ILogger } from '../interfaces/i-logger';
import { TaskHistory } from '../models/Core/task-history';
import { DayOfWeek } from '../models/Core/day-of-week.enum';
import { DateService } from './date.service';
import { IDataSyncLocalService } from '../interfaces/i-data-sync-local-service';
import NumberUtils from '../shared/number-utils';
import { DatePipe } from '@angular/common';
import { TaskGroup } from '../models/Core/task-group';
import { UserService } from './user.service';
import { DTOTaskGroup } from '../models/DTO/dto-task-group';
import { EventData, EventService } from './event.service';

@Injectable({
  providedIn: 'root'
})
export class CalendarTaskService {

  public static UnassignedId: string = 'unassigned';

  // public allTasksNoOrder: CalendarTask[] = [];
  public allGroups: TaskGroup[] = [];
  public currentProgressTotal: number;
  public currentProgressDone: number;
  public currentProgressText: string;
  public currentProgressValue: number;
  public enableDragAndDrop: boolean;

  constructor(private apiProvider: IApiProvider,
              private local: ILocalStorageService,
              private localDataSync: IDataSyncLocalService,
              private logger: ILogger,
              private dateService: DateService,
              private datepipe: DatePipe,
              private userService: UserService,
              private eventService: EventService) { }

  public getAllPresentTasks(): CalendarTask[] {
    const result: CalendarTask[] = [];

    const dateStart = new Date();
    console.log('getAllPresentTasks (EXPONENTIAL)', dateStart.toISOString());
    // TODO: BIG NONO this is exponential
    for (const group of this.allGroups) {
      for (const task of group.Tasks) {
        if (task.Void !== true &&
            ((task.Frequency !== TaskFrequency.Once &&
              task.Frequency !== TaskFrequency.UntilDone) ||
              !task.Histories.some(t => t.TaskDone &&
                                        !t.Void &&
                                        t.DoneWorkDate < this.dateService.GetTodayWorkDate()))) {
          result.push(task);
        }
      }
    }
    console.log('getAllPresentTasks DONE (EXPONENTIAL)', dateStart.toISOString());

    return result;
  }

  public getAllTasks(): CalendarTask[] {
    const result: CalendarTask[] = [];

    for (const group of this.allGroups) {
      for (const task of group.Tasks) {
        result.push(task);
      }
    }

    return result;
  }

  public getTask(calendarTaskId: string): CalendarTask {
    // TODO : Use some kind of index instead ?
    for (const group of this.allGroups) {
      for (const task of group.Tasks) {
        if (task.CalendarTaskId === calendarTaskId) {
          return task;
        }
      }
    }

    // console.log('CalendartaskId = ', calendarTaskId);
    // console.log('AllGroups = ', this.allGroups);
    throw new CalendarTaskNotFoundError('getTask : Unable to find calendar task index while setting as sent 1');
  }

  public getTaskFromStatType(statType: StatType) {
    for (const group of this.allGroups) {
      for (const task of group.Tasks) {
        if (task.StatType === statType) {
          return task;
        }
      }
    }

    return null;
  }

  /**
   * Inserts task in RAM and adds to queue to insert in Local
   * Tasks also get reordered, groups are set to visible // TODO : we might want to move this in tasklist in event
   */
  public async insertCalendarTask(task: CalendarTask): Promise<boolean> {

    task.InsertDate = new Date();
    task.UpdateDate = new Date();

    this.logger.logEvent('inserting task', { key: 'task', value: JSON.stringify(task)});
    // console.log('INSERTING TASK', task);

    this.eventService.emit(new EventData(EventService.EventIds.SyncRequired, null));

    // INITIALIZE VALUES
    if (task.GroupId == null) {
      task.GroupId = CalendarTaskService.UnassignedId;
    }
    if (task.InitialGroupId == null) {
      task.InitialGroupId = task.GroupId;
    }
    if (task.InitialAbsolutePosition == null) {
      task.InitialAbsolutePosition = 500;
    }

    task.Sent = false;

    // CHECK IF ALREADY EXISTS
    const alreadyExists = this.getAllTasks().some(p => p.CalendarTaskId === task.CalendarTaskId);
    if (alreadyExists === true) {
      this.logger.logError(new Error('Task already exists'));
      return false;
    }

    // CHECK IF ABSOLUTEPOSITION ALREADY EXISTS AND SORT ACCORDINGLY
    const existingTasks = this.getAllPresentTasks().filter(p => !p.Void &&
                                                                p.AbsolutePosition === task.AbsolutePosition &&
                                                                p.GroupId === task.GroupId);
    if (existingTasks.length > 0) {
      // console.log('Position already exists, reordering tasks, task =, InitialPosition=', existingTasks, task.InitialAbsolutePosition);

      // Push
      const group = this.getGroup(task.GroupId);
      group.Tasks.push(task);
      await this.reassignOrderTask(task); // it's very long we have to optimize this, It gets inserted here
    } else {
      // console.log('Position does not already exist, InitialPosition=', task.InitialAbsolutePosition);

      // Push
      const group = this.getGroup(task.GroupId);
      group.Tasks.push(task);
      group.Tasks = this.getSortedTasksFromTasks(group.Tasks);
    }

    this.setGroupsVisible();

    await this.localDataSync.queueInsertCalendarTask(task.toDTO());
    return true;
  }

  /**
   * Inserts tasks in RAM and adds to queue to insert in Local
   * Tasks also get reordered, groups are set to visible
   */
  public async insertCalendarTasks(tasks: CalendarTask[]): Promise<boolean> {

    this.logger.logEvent('inserting task', { key: 'task', value: JSON.stringify(tasks)});
    // console.log('INSERTING TASK', task);

    this.eventService.emit(new EventData(EventService.EventIds.SyncRequired, null));

    // INITIALIZE VALUES
    for (const task of tasks) {
      task.InsertDate = new Date();
      task.UpdateDate = new Date();

      if (task.GroupId == null) {
        task.GroupId = CalendarTaskService.UnassignedId;
      }
      if (task.InitialGroupId == null) {
        task.InitialGroupId = task.GroupId;
      }
      if (task.InitialAbsolutePosition == null) {
        task.InitialAbsolutePosition = 500;
      }

      task.Sent = false;

      // CHECK IF ALREADY EXISTS
      const alreadyExists = this.getAllTasks().some(p => p.CalendarTaskId === task.CalendarTaskId);
      if (alreadyExists === true) {
        this.logger.logError(new Error('Task already exists'));
        return false;
      }

      // CHECK IF ABSOLUTEPOSITION ALREADY EXISTS AND SORT ACCORDINGLY
      const existingTasks = this.getAllPresentTasks().filter(p => !p.Void &&
                                                                  p.AbsolutePosition === task.AbsolutePosition &&
                                                                  p.GroupId === task.GroupId);
      if (existingTasks.length > 0) {
        // console.log('Position already exists, reordering tasks, task =, InitialPosition=', existingTasks, task.InitialAbsolutePosition);

        // Push
        const group = this.getGroup(task.GroupId);
        group.Tasks.push(task);
        await this.reassignOrderTask(task); // it's very long we have to optimize this, It gets inserted here
      } else {
        // console.log('Position does not already exist, InitialPosition=', task.InitialAbsolutePosition);

        // Push
        const group = this.getGroup(task.GroupId);
        group.Tasks.push(task);
        group.Tasks = this.getSortedTasksFromTasks(group.Tasks);
      }
    }

    this.setGroupsVisible();

    await this.localDataSync.queueInsertCalendarTasks(tasks.map(p => p.toDTO()));
    return true;
  }

  /**
   * Updates task into RAM, reorder tasks,
   * sets groups to visible // TODO : we might want to move this in tasklist in event
   */
  public async updateCalendarTask(task: CalendarTask): Promise<boolean> {
    // log too long which includes all histories
    this.logger.logEvent('updating task', { key: 'task', value: JSON.stringify(task)});

    // console.log('Updating task', task);
    task.UpdateDate = new Date();

    this.eventService.emit(new EventData(EventService.EventIds.SyncRequired, null));

    this.replaceTaskInRam(task);

    if ((task.AbsolutePosition !== task.InitialAbsolutePosition ||
         task.InitialGroupId !== task.GroupId) &&
        task.Void  === false) {
      await this.reassignOrderTask(task);
    }

    this.setGroupsVisible();
    await this.updateTaskAsyncNoPositionCheck(task, false);
    return true;
  }

  private replaceTaskInRam(task: CalendarTask) {
    const targetGroup = this.getGroup(task.GroupId);
    console.log('replacing in ram', targetGroup, task.GroupId, task, this.allGroups);

    if (task.InitialGroupId !== task.GroupId) {
      // remove from old group
      const oldGroup = this.getGroup(task.InitialGroupId);
      if (oldGroup != null) {
        const oldIndex = oldGroup.Tasks.findIndex(p => p.CalendarTaskId === task.CalendarTaskId);
        if (oldIndex !== -1) {
          oldGroup.Tasks.splice(oldIndex, 1);
        }
      }
      // remove from target group
      if (targetGroup != null) {
        const newIndex = targetGroup.Tasks.findIndex(p => p.CalendarTaskId === task.CalendarTaskId);
        if (newIndex !== -1) {
          console.log('removing from target group');
          targetGroup.Tasks.splice(newIndex, 1);
        }
      }
      // add into new group
      targetGroup.Tasks.push(task);
    } else {
      console.log('TARGET GROUP BEFORE', targetGroup.Tasks.map(p => p.AbsolutePosition));
      const index = targetGroup.Tasks.findIndex(p => p.CalendarTaskId === task.CalendarTaskId);
      targetGroup.Tasks[index] = task;
      console.log('TARGET GROUP AFTER', targetGroup.Tasks.map(p => p.AbsolutePosition));
    }

    console.log('replaced in ram', targetGroup);
  }

  public async reassignOrderTask(task: CalendarTask): Promise<void> {
    const difference = task.AbsolutePosition - task.InitialAbsolutePosition;
    const lowest = Math.min(task.AbsolutePosition, task.InitialAbsolutePosition);
    const highest = Math.max(task.AbsolutePosition, task.InitialAbsolutePosition);

    // console.log('Lowest Highest', lowest, highest, task.AbsolutePosition, task.InitialAbsolutePosition);

    // Get Group
    const groupIndex = this.allGroups.findIndex(p => p.GroupId === task.GroupId); // TODO: Function to get group
    const group = this.allGroups[groupIndex];

    // console.log('reordering positions : ', group.Tasks.map(p => p.AbsolutePosition));

    /*this.logger.logEvent('REORDERING POSITIONS',
    {
      key: 'absolutepositions',
      value: JSON.stringify(group.Tasks.map(p => p.AbsolutePosition))
    });*/

    if (NumberUtils.checkIfDuplicateExists(group.Tasks.filter(p => p.CalendarTaskId !== task.CalendarTaskId)
                                                      .map(p => p.AbsolutePosition))) { // reorder all if 2 are the same

      // this.logger.logEvent('Update all tasks', { key: 'task.CalendarTaskId', value: JSON.stringify(task.UserId)});
      await this.reorderGroupTasks(task); // reorder group tasks, HERE WE ARE ADDING IT
    } else {
      // this.logger.logEvent('Update NOT all tasks', { key: 'task.CalendarTaskId', value: JSON.stringify(task.UserId)});

      const tasksToReorder = group.Tasks.filter(p => p.AbsolutePosition >= lowest &&
                                                     p.AbsolutePosition <= highest &&
                                                     p.CalendarTaskId !== task.CalendarTaskId);
      // console.log('TASKS TO REORDER', tasksToReorder);
      for (const currentTask of tasksToReorder) {
        if (difference < 0) {
          const newPosition = currentTask.AbsolutePosition + 1;
          // console.log('DIFFERENCE NEGATIVE NEW POSITION = ', newPosition);
          currentTask.AbsolutePosition = newPosition;
          currentTask.InitialAbsolutePosition = newPosition;
        } else {
          const newPosition = currentTask.AbsolutePosition - 1;
          // console.log('DIFFERENCE POSITIVE NEW POSITION = ', newPosition);
          currentTask.AbsolutePosition = newPosition;
          currentTask.InitialAbsolutePosition = newPosition;
        }
      }

      group.Tasks = this.getSortedTasksFromTasks(group.Tasks);
      // console.log('GROUPS TASKS ', group.Tasks);

      await this.updateTaskAsyncNoPositionCheckBatch(tasksToReorder);
    }

    // console.log('reordering positions : ', group.Tasks.map(p => p.AbsolutePosition));
  }

  public getGroup(groupId: string) {
    const groupIndex = this.allGroups.findIndex(p => p.GroupId === groupId);
    if (groupIndex !== -1) {
      return this.allGroups[groupIndex];
    } else {
      return null;
    }
  }

  /**
   * Reorders the tasks in a group. Checks if two have the same position, the new one will take it's place
   * Also queues updates to local
   */
  public async reorderGroupTasks(task: CalendarTask) {
    // console.log('REORDER GROUP', task);
    const group = this.getGroup(task.GroupId);

    const tasks = group.Tasks.sort((x, y) => x.AbsolutePosition > y.AbsolutePosition ||
                                             (x.AbsolutePosition === y.AbsolutePosition &&
                                              x.InitialAbsolutePosition < y.InitialAbsolutePosition) ? 1 : -1);

    let positionIterator = 1;
    for (const currentTask of tasks) {
      currentTask.AbsolutePosition = positionIterator++;
      currentTask.InitialAbsolutePosition = currentTask.AbsolutePosition;
    }

    group.Tasks = this.getSortedTasksFromTasks(group.Tasks);

    await this.updateTaskAsyncNoPositionCheckBatch(tasks);
  }

  private async updateTaskAsyncNoPositionCheck(task: CalendarTask,
                                               synced: boolean = true) {
    // console.log('updateTaskAsyncNoPositionCheck', task, synced);
    // TODO : We might need to assign the task to group tasks
    task.Synced = synced;
    await this.localDataSync.queueUpdateCalendarTask(task.toDTO(), synced);
    return true;
  }

  private async updateTaskAsyncNoPositionCheckBatch(tasks: CalendarTask[],
                                                    synced: boolean = true) {
    // console.log('updateTaskAsyncNoPositionCheckBatch', tasks, synced);
    // TODO : We might need to assign the tasks to group tasks
    tasks.forEach(p => p.Synced = synced);
    await this.localDataSync.queueUpdateCalendarTasks(tasks.map(p => p.toDTO()), synced);
    return true;
  }

  /**
   * Reload all tasks from server and updates them into local storage (without queue)
   */
  public async getAllTodoFromServer(request: DTOGetCalendarTaskRequest): Promise<DTOCalendarTask[]> {
    const resultRemote = await this.apiProvider.getTasks(request);

    console.log('RESULT FROM SERVER', resultRemote);

    // todo: try to move this out of this class
    if (resultRemote != null && resultRemote.length > 0) {
      this.setSyncedToTrue(resultRemote);
      // await this.local.setCalendarTasks(resultRemote, false);
      return resultRemote;
    } else {
      this.logger.logError(new Error('updating task'));
      return throwError('unable to get data from server').toPromise();
    }
  }

  public async reloadAllGroupsAndTasksLocal(): Promise<void> {
    try {

      console.log('reloadAllGroupsAndTasksLocal');

      let dtoTasks: DTOCalendarTask[] = [];
      let dtoGroups: DTOTaskGroup[] = [];

      dtoTasks = await this.local.getCalendarTasks(false);
      dtoGroups = await this.local.getGroups(false);

      // console.log('GOT TASKS AND GROUPS LOCAL', dtoTasks, dtoGroups);

      this.processAndAssignAllGroupsAndTasks(dtoTasks, dtoGroups);
    } catch (error) {
      // console.log('Error refreshing local', error);
      this.logger.logError(error);
    }
  }

  public async processAndAssignAllGroupsAndTasks(dtoTasks: DTOCalendarTask[], dtoGroups: DTOTaskGroup[]): Promise<void> {
    try {
      // ASSIGN TASKS + REORDER + SET PROGRESS + SET VISIBLE
      // console.log('dtogroups', dtoGroups);
      this.allGroups = dtoGroups.map(p => TaskGroup.fromDTO(p));
      this.assignTasksAndProcessUnassigned(dtoTasks);
      this.sortTasksAndGroups();
      this.setProgressText(this.dateService.currentWorkDate);
      this.setGroupsVisible();

      const notifs = dtoTasks.filter(p => p.NotificationId === 1 && p.Void === false);
      if (notifs.length > 1) {
        this.logger.logError(new Error('More than 1 notif has NotificationId = 1'));
      }
    } catch (error) {
      // console.log('Error processAllGroupsAndTasks local', error);
      this.logger.logError(error);
    }
  }

  // todo: try to move this out of this class
  private setSyncedToTrue(resultRemote: DTOCalendarTask[]) {
    resultRemote.forEach(p => {
      p.Synced = true;
      p.Sent = true;
      p.Histories.forEach(t => {
        t.Synced = true;
        t.Sent = true;
      });
    });
  }

  public async getTaskListDTORequest(): Promise<DTOGetCalendarTaskRequest> {
    const request = new DTOGetCalendarTaskRequest();
    request.userId = await this.userService.getCurrentUserId();
    // console.log('USERID TEST = ', request.userId);
    request.IncludeVoid = false;
    request.DateStart = DateUtils.YearAgo();
    request.DateEnd = DateUtils.Tomorrow();
    return request;
  }

  public getTaskHistoryNoVoid(task: CalendarTask,
                              workDate: Date): TaskHistory {
    if (task.Void === true) {
      return new TaskHistory();
    }

    if (task.InsertDate != null && this.dateService.GetWorkDate(task.InsertDate) > workDate) {
      return new TaskHistory();
    }

    const histories = task.GetDoneHistoriesNoVoid(workDate);

    if (histories != null && histories.length > 0) {
      if (histories.length === 1) {
        return histories[0];
      } else {
        if (histories.filter(p => p.InsertDate != null).length === 0) {
          this.logger.logEvent('histories.filter(p => p.InsertDate != null).length === 0',
          {
            key: 'histories',
            value: JSON.stringify(histories)
          });
          const indexNotSkipped = histories.findIndex(p => p.TaskSkipped === false);
          if (indexNotSkipped !== -1) {
            return histories[indexNotSkipped];
          } else {
            this.logger.logEvent('returning histories[0]',
            {
              key: 'histories',
              value: JSON.stringify(histories)
            });
            return histories[0];
          }
        } else {
          return histories.filter(p => p.InsertDate != null)
                          .sort((a, b) => {
                            return b.InsertDate.getTime() - a.InsertDate.getTime();
                          })[0];
        }
      }
    } else {
      return new TaskHistory();
    }
  }

  public isDone(task: CalendarTask,
                taskHistoryNoVoid: TaskHistory): boolean {
    // console.log('Origin isDone should only be called once');
    if (task.Frequency === TaskFrequency.Once ||
        task.Frequency === TaskFrequency.UntilDone) {
      return task.Histories.some(p => !p.Void && p.TaskDone);
    } else {
      return taskHistoryNoVoid.TaskDone;
    }
  }

  public isDoneAtDate(task: CalendarTask,
                      workDate: Date,
                      taskHistoryNoVoid: TaskHistory): boolean {
    // console.log('Origin IsDoneAtDate');
    if (task.Frequency === TaskFrequency.Once ||
      task.Frequency === TaskFrequency.UntilDone) {
      return task.GetDoneHistoriesNoVoid(workDate)
                 .some(p => p.TaskDone);
    } else {
      return taskHistoryNoVoid.TaskDone;
    }
  }

  public getDoneWorkDate(task: CalendarTask): Date {
    // console.log('[getDoneWorkDate] This is exponential');
    const doneHistories = task.Histories.filter(p => !p.Void && p.TaskDone);
    if (doneHistories != null && doneHistories.length > 0) {
      return doneHistories[0].DoneWorkDate;
    } else {
      return null;
    }
  }

  public isSkipped(taskHistoryNoVoid: TaskHistory): boolean {
    // console.log('Origin IsSkipped');
    return taskHistoryNoVoid.TaskSkipped;
  }

  public isDoneOrSkipped(task: CalendarTask,
                         workDate: Date): boolean {
    // console.log('Origin IsDoneOrSkipped');
    const history = this.getTaskHistoryNoVoid(task, workDate);
    if (history.DoneWorkDate != null || history.TaskSkipped) {
      return true;
    } else {
      return false;
    }
  }

  // TODO : This is called twice on loading, which calls everything twice
  public isShown(task: CalendarTask,
                 day: DayOfWeek,
                 workDate: Date): boolean {

    if (task.Void === true) {
      return false;
    }

    if (task.InsertDate != null && this.dateService.GetWorkDate(task.InsertDate) > workDate) {
      return false;
    }

    if (task.SkipUntil != null &&
        task.SkipUntil > workDate) {
        return false;
      }

    if (task.Frequency === TaskFrequency.Daily) {
      return task.RequiredDays.some(t => t === day);
    } else if (task.Frequency === TaskFrequency.Once) {
      return DateUtils.datesAreEqual(task.AssignedDate, workDate);
    } else if (task.Frequency === TaskFrequency.UntilDone) {
      const doneWorkDate = this.getDoneWorkDate(task);
      if (doneWorkDate != null) {
        return doneWorkDate >= workDate;
      } else {
        return task.AssignedDate <= workDate;
      }
    }
  }

  public hasNote(task: CalendarTask,
                 workDate: Date): boolean {
    // console.log('Origin hasNote');
    const history = this.getTaskHistoryNoVoid(task, workDate);
    return history != null && history.Comment != null && history.Comment.length > 0;
  }

  public getPreviousDayTaskHistoryNoVoid(task: CalendarTask,
                                         minusDays: number): TaskHistory {
    // console.log('[2]datesAreEqual getPreviousDayTaskHistoryNoVoid');
    const targetWorkDate = DateUtils.AddDays(DateUtils.Today(), - minusDays);
    const history = task.GetDoneHistoriesNoVoid(targetWorkDate)[0];
    if (history != null) {
      return history;
    } else {
      return new TaskHistory();
    }
  }

  public removeDuplicates(set) {
    const seen = {};
    return set.filter((item: TaskHistory) => {
        const k = item.TaskHistoryId;
        return seen.hasOwnProperty(k) ? false : (seen[k] = true);
    });
  }

  public SetHistoriesMap(task: CalendarTask): void {
    // console.log('Setting Histories Map', task.Name);
    let firstWorkDate: Date;
    task.HistoriesMap.clear();

    // TODO : Remove Temporary patch ? Put in place in 2020-06-04 because somehow some duplicates got created
    task.Histories = this.removeDuplicates(task.Histories);

    for (const history of task.Histories) {
      if (history.Void) {
        continue;
      }

      if (history.DoneWorkDate == null) { // patch for retro compatibility but hurts performance
        history.DoneWorkDate = this.dateService.GetWorkDate(history.DoneDate);
      }

      let existingHistories = task.HistoriesMap.get(history.DoneWorkDate.toISOString());
      if (existingHistories == null) {
        existingHistories = [];
      }
      existingHistories.push(history);
      task.HistoriesMap.set(history.DoneWorkDate.toISOString(), existingHistories);

      if (history.DoneWorkDate < firstWorkDate || firstWorkDate == null) {
        firstWorkDate = history.DoneWorkDate;
      }
    }
    task.MinimumStartingMinusDay = DateUtils.daysBetween(firstWorkDate, new Date());
    // console.log('minimumstartingminusday = ', task.MinimumStartingMinusDay);
  }

  public getTaskResult(currentTask: CalendarTask, workDate: Date): string {
    // console.log('Origin getTaskResult');
    const history = this.getTaskHistoryNoVoid(currentTask, workDate);

    if (currentTask.isTime()) {
      return this.datepipe.transform(history.TaskResult, 'HH:mm');
    } else if (currentTask.isDuration()) {
      return history.getDurationString();
    } else {
      return String(history.TaskResult);
    }
  }

  public getTaskResultFromHistory(currentTask: CalendarTask, history: TaskHistory): string {
    // console.log('Origin getTaskResult');
    if (currentTask.isTime()) {
      return this.datepipe.transform(history.TaskResult, 'HH:mm');
    } else if (currentTask.isDuration()) {
      return history.getDurationString();
    } else {
      return String(history.TaskResult);
    }
  }


  /////////////////////////////////////////////////////////////
  ////////////////////     GROUPS     /////////////////////////
  /////////////////////////////////////////////////////////////

  public async assignTasksAndProcessUnassigned(dtoTasks: DTOCalendarTask[]): Promise<void> {
    // console.log('DTOTASKS', dtoTasks, this.getAllTasks());
    // Last position
    let position = 1;
    if (this.allGroups.filter(p => p.GroupId !== CalendarTaskService.UnassignedId).length > 0) {
      position = Math.max(...this.allGroups.map(p => p.Position)) + 1;
    }

    const group1 = new TaskGroup();
    group1.Name = 'Unassigned';
    group1.Position = position;
    group1.InitialPosition = position;
    group1.ColorHex = '#D1D1D1';
    group1.isVisible = true;
    group1.isUnassigned = true;
    group1.GroupId = CalendarTaskService.UnassignedId;
    this.allGroups.push(group1);

    // TODO : This is extremely innefficient
    // Add tasks to groups + convert from DTO
    for (const task of dtoTasks) {
      const index = this.allGroups.findIndex(p => p.GroupId === task.GroupId);

      if (index >= 0) {
        this.allGroups[index].Tasks.push(CalendarTask.fromDTO(task));
      } else {
        //task.GroupId = null;
        task.GroupId = CalendarTaskService.UnassignedId;
        group1.Tasks.push(CalendarTask.fromDTO(task));
      }
    }

    // console.log('4444 assign tasks done');
  }

  public sortTasksAndGroups() {
    for (const group of this.allGroups) {
      group.Tasks = group.Tasks.sort((x, y) => x.AbsolutePosition > y.AbsolutePosition ? 1 : -1);

      // CREATE HISTORYMAP
      // TODO : Not sure we need this ? taskListResult.filter(p => p.Frequency !== TaskFrequency.UntilDone || p.AssignedDate != null);
      for (const task of group.Tasks) {
        this.SetHistoriesMap(task);
      }
    }

    // SORT GROUPS
    this.allGroups = this.allGroups.sort((x, y) => x.Position > y.Position ? 1 : -1);
  }

  public setGroupsVisible() {
    // console.log('SETGROUPSVISIBLE');
    for (const group of this.allGroups) {
      if (group.Void === true || group.Tasks.length === 0) {
        // console.log('GROUP ' + group.Name + 'NOT VISIBLE BECAUSE VOIDED OR EMPTY');
        group.isVisible = false;
      } else {
        if (group.Tasks.length === 0 ||
          !group.Tasks.some(p => this.isShown(p,
            this.dateService.currentWorkDate.getDay(),
            this.dateService.currentWorkDate))) {
          // console.log('GROUP ' + group.Name + 'NOT VISIBLE BECAUSE NO PRESENT TASK');
          group.isVisible = false;
        } else {
          // console.log('GROUP ' + group.Name + 'VISIBLE BECAUSE PREVENT TASK');
          group.isVisible = true;
        }
      }
    }
  }

  public async getAllGroupsFromServer(): Promise<DTOTaskGroup[]> {
    //console.log('getAllGroupsFromServer');
    const userId = await this.userService.getCurrentUserId();
    const resultRemote = await this.apiProvider.getGroups(userId);

    // todo: try to move this out of this class
    if (resultRemote != null && resultRemote.length > 0) {

      console.log('RESULT FROM SERVER GROUPS', resultRemote);

      this.setGroupSyncedToTrue(resultRemote);

      // await this.local.setGroups(resultRemote, false);
      return resultRemote;
    } else {
      this.logger.logError(new Error('updating task'));
      throw new Error('unable to get data from server');
    }
  }

  private setGroupSyncedToTrue(resultRemote: DTOTaskGroup[]) {
    resultRemote.forEach(p => {
      p.Synced = true;
      p.Sent = true;
    });
  }

  public async insertGroup(group: TaskGroup): Promise<void> {

    //console.log('INSERTING GROUP ', group);

    group.UpdateDate = new Date();
    group.InsertDate = new Date();

    this.eventService.emit(new EventData(EventService.EventIds.SyncRequired, null));

    // Check if AbsolutePosition already exists
    const existingGroups = this.allGroups.filter(p => p.Position === group.Position);
    if (existingGroups.length > 0) {
        group.InitialPosition = Math.max(...this.allGroups.map(p => p.Position)) + 1;
        // console.log('Position already exists, reordering tasks, task =, InitialPosition=', existingTasks, group.InitialPosition);
        await this.reorderGroups(group); // it's very long we have to optimize this
    } else {
      // console.log('Position does not already exist, InitialPosition=', group.InitialPosition);
    }

    this.allGroups.push(group);

    this.allGroups = this.getSortedGroups(this.allGroups);

    await this.localDataSync.queueInsertGroup(group.toDTO());
    await this.localDataSync.queueUpdateCalendarTasks(group.Tasks.map(p => p.toDTO()), false);
    this.eventService.emit(new EventData(EventService.EventIds.SyncRequired, null));

    // REMOVE TASKS FROM OTHER GROUPS
    // TODO : This is very innefficient
    const otherGroups = this.allGroups.filter(p => p.GroupId !== group.GroupId);
    for (const otherGroup of otherGroups) {
      for (const task of group.Tasks) {
        if (otherGroup.Tasks.map(p => p.CalendarTaskId).some(p => p === task.CalendarTaskId)) {
          // console.log('REMOVING FROM OTHER GROUP : ', task.Name);
          otherGroup.Tasks = otherGroup.Tasks.filter(p => p.CalendarTaskId !== task.CalendarTaskId);
        }
      }
    }

    this.setGroupsVisible(); // TODO: This is probably inefficient
  }

  public async updateGroup(group: TaskGroup): Promise<boolean> {
    console.log('UPDATING GROUP', group);
    group.UpdateDate = new Date();

    // REORDER
    if (group.Position !== group.InitialPosition &&
        group.Void  === false) {
      // console.log('reordering task necessary', new Date().toISOString());
      await this.reorderGroups(group);
    }

    //console.log('NEW GROUP ORDER : ', this.allGroups);

    await this.localDataSync.queueUpdateGroup(group.toDTO(), false);

    // REMOVE TASKS FROM OTHER GROUPS
    // TODO : This is very innefficient
    const otherGroups = this.allGroups.filter(p => p.GroupId !== group.GroupId);
    for (const otherGroup of otherGroups) {
      for (const task of group.Tasks) {
        if (otherGroup.Tasks.map(p => p.CalendarTaskId).some(p => p === task.CalendarTaskId)) {
          // console.log('REMOVING FROM OTHER GROUP : ', task.Name);
          otherGroup.Tasks = otherGroup.Tasks.filter(p => p.CalendarTaskId !== task.CalendarTaskId);
        }
      }
    }

    // Put back tasks into unassigned for void
    if (group.Void === true) {
      const toUpdateTasks: CalendarTask[] = [];
      const unassignedGroup = this.getGroup(CalendarTaskService.UnassignedId);
      for (const task of this.getAllTasks()) {
        if (task.GroupId === group.GroupId) {
          task.GroupId = CalendarTaskService.UnassignedId;
          // console.log('Setting to sync = false', task);
          task.Synced = false;
          unassignedGroup.Tasks.push(task);
          // console.log('UNASSIGNED GROUP', unassignedGroup);
          toUpdateTasks.push(task);
        }
      }

      if (toUpdateTasks.length > 0) {
        await this.localDataSync.queueUpdateCalendarTasks(toUpdateTasks.map(p => p.toDTO()), false);
        this.eventService.emit(new EventData(EventService.EventIds.SyncRequired, null));
      }

      // Remove from groups if voided
      // Update : cant do that because if we delete it has to stay in memory
      // const index = this.allGroups.findIndex(p => p.GroupId === group.GroupId);
      // this.allGroups.splice(index, 1);
    }

    this.setGroupsVisible();

    return true;
  }

  public getUnassignedGroup(): TaskGroup {
    const index = this.allGroups.findIndex(p => p.isUnassigned === true);
    return this.allGroups[index];
  }

  public async reorderGroups(group: TaskGroup): Promise<void> {
    const difference = group.Position - group.InitialPosition;
    const lowest = Math.min(group.Position, group.InitialPosition);
    const highest = Math.max(group.Position, group.InitialPosition);

    let groups = this.allGroups
                     .filter(p => p.Position >= lowest &&
                                  p.Position <= highest);

    this.logger.logEvent('REORDERING GROUP POSITIONS',
    {
      key: 'positions',
      value: JSON.stringify(groups.map(p => p.Position))
    });

    if (NumberUtils.checkIfDuplicateExists(groups.filter(p => p.GroupId !== group.GroupId)
                                                 .map(p => p.Position))) { // reorder all if 2 are the same

      this.logger.logEvent('Update all tasks', { key: 'group.userId', value: JSON.stringify(group.UserId)});

      await this.reorderAllGroups(group);
    } else {

      this.logger.logEvent('Update NOT all tasks', { key: 'group.userId', value: JSON.stringify(group.UserId)});

      // reorder only between current and new Id
      groups = groups.filter(p => p.Position >= lowest &&
                                  p.Position <= highest &&
                                  p.GroupId !== group.GroupId);

      for (const currentGroup of groups) {

        if (difference < 0) {
          const newPosition = currentGroup.Position + 1;
          currentGroup.Position = newPosition;
          currentGroup.InitialPosition = newPosition;
        } else {
          const newPosition = currentGroup.Position - 1;
          currentGroup.Position = newPosition;
          currentGroup.InitialPosition = newPosition;
        }
      }

      console.log('REORDERED GROUPS : ', groups);

      this.reorderAllRamGroups();

      await this.updateGroupsAsyncNoPositionCheckBatch(groups);
    }

    // this.logger.logEvent('Update completed');
  }

  public async reorderAllGroups(group: TaskGroup) {
    console.log('reorder all groups', group);
    let groups = this.allGroups
                    .filter(p => p.GroupId !== group.GroupId);
    groups.push(group);
    groups = groups.sort((x, y) => x.Position > y.Position ? 1 : -1);

    console.log('sorted groups', groups);

    let positionIterator = 1;
    for (const g of groups) {
      g.Position = positionIterator++;
      g.InitialPosition = g.InitialPosition;
    }

    await this.updateGroupsAsyncNoPositionCheckBatch(groups);
  }

  public reorderAllRamGroups(): void {
    this.allGroups = this.allGroups.sort((x, y) => x.Position > y.Position ? 1 : -1);
  }

  private async updateGroupsAsyncNoPositionCheckBatch(groups: TaskGroup[],
                                                      synced: boolean = true) {
    console.log('updateGroupsAsyncNoPositionCheckBatch', groups, synced);
    groups.forEach(p => p.Synced = synced);
    for (const group of groups) {
      const index = this.allGroups.findIndex(p => p.GroupId === group.GroupId);
      this.allGroups[index] = group;
    }

    await this.localDataSync.queueUpdateGroups(groups.map(p => p.toDTO()), synced);
    return true;
  }

  private getSortedGroups(taskListResult: TaskGroup[]): TaskGroup[] {
    return taskListResult.sort((a, b) => {
                              const diff = a.Position - b.Position;
                              if (diff) {
                                return diff;
                              }
                            });
  }

  public getSortedTasksFromTasks(tasks: CalendarTask[]): CalendarTask[] {
    const result = tasks.sort((x, y) => x.AbsolutePosition > y.AbsolutePosition ||
                                        (x.AbsolutePosition === y.AbsolutePosition &&
                                         x.InitialAbsolutePosition < y.InitialAbsolutePosition) ? 1 : -1);

    result.forEach(p => p.InitialAbsolutePosition = p.AbsolutePosition);
    return result;
  }

  public setProgressText(currentWorkDate: Date) {
    this.currentProgressTotal = 0;
    this.currentProgressDone = 0;
    const currentWorkDay = currentWorkDate.getDay();
    // Completed Text // most be done lazy loading
    for (const group of this.allGroups) {
      // Set Local progress
      group.ProgressTotal = group.Tasks.filter(p =>
        this.isShown(p, currentWorkDay, currentWorkDate) ||
        this.isSkipped(this.getTaskHistoryNoVoid(p, currentWorkDate))
      ).length;
      // console.log('PROGRESS TOTAL ' + group.Name, group.ProgressTotal);

      group.ProgressDone = group.Tasks.filter(p => p.Void !== true &&
                                                   this.isDoneOrSkipped(p,
                                                   currentWorkDate)).length;
      // Increment max for the top progress
      this.currentProgressTotal += group.ProgressTotal;
      this.currentProgressDone += group.ProgressDone;

      // Set Text
      group.ProgressText = group.ProgressDone.toString() + '/' + group.ProgressTotal.toString();
    }

    this.currentProgressText = this.currentProgressDone.toString() + '/' + this.currentProgressTotal.toString();
    this.currentProgressValue = this.currentProgressTotal === 0 ? 0 : this.currentProgressDone / this.currentProgressTotal;
  }
}
