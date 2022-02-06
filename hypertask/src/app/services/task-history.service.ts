import { Injectable } from '@angular/core';
import { TaskHistory } from '../models/Core/task-history';
import { CalendarTaskService } from './calendar-task.service';
import { IDataSyncLocalService } from '../interfaces/i-data-sync-local-service';
import { ILogger } from '../interfaces/i-logger';
import { TaskHistoryAlreadyExistsError } from '../models/Exceptions/TaskHistoryAlreadyExistsError';
import { EventData, EventService } from './event.service';

@Injectable({
  providedIn: 'root'
})
export class TaskHistoryService {

  constructor(private localDataSync: IDataSyncLocalService,
              private taskService: CalendarTaskService,
              private logger: ILogger,
              private eventService: EventService) { }

  public async insertTaskHistory(history: TaskHistory): Promise<boolean> {

    history.UpdateDate = new Date();
    history.InsertDate = new Date();

    this.eventService.emit(new EventData(EventService.EventIds.SyncRequired, null));
    // console.log('insertTaskHistory', history);
    const task = this.taskService.getTask(history.CalendarTaskId);
    // console.log('inserting local with sent false', task);
    if (task.Histories.some(p => p.TaskHistoryId === history.TaskHistoryId)) {
      this.logger.logError(new Error('Task History already exists'));
      throw new TaskHistoryAlreadyExistsError('historyId = ' + history.TaskHistoryId);
    }
    task.Histories.push(history);
    history.Sent = false;
    this.taskService.SetHistoriesMap(task); // todo this should not be here ?
    // console.log('inserted local with sent false', task, task);
    this.localDataSync.queueInsertTaskHistory(history.toDTO());
    // this.logger.logDebug('queueInsertTaskHistory', JSON.stringify(history.toDTO()));
    return true;
  }

  public async updateTaskHistory(history: TaskHistory): Promise<boolean> {

    history.UpdateDate = new Date();

    // console.log('updateTaskHistory', history);
    // this.logger.logDebug('UpdateTaskHistory', JSON.stringify(history));

    this.eventService.emit(new EventData(EventService.EventIds.SyncRequired, null));

    history.Synced = false;
    const task = this.taskService.getTask(history.CalendarTaskId);
    const index = task.Histories.findIndex(p => p.TaskHistoryId === history.TaskHistoryId); // TODO : Use MAP
    task.Histories[index] = history;
    this.taskService.SetHistoriesMap(task); // todo this should not be here ?
    this.localDataSync.queueUpdateTaskHistory(history.toDTO());
    return true;
  }
}
