import { DTOCalendarTask } from '../models/DTO/dto-calendar-task';
import { DTOTaskHistory } from '../models/DTO/dto-task-history';
import { DTOTaskTimer } from '../models/DTO/dto-timer';
import { DTOTaskGroup } from '../models/DTO/dto-task-group';

export abstract class IDataSyncLocalService {
  abstract allDataIsSynced(): Promise<boolean>;
  abstract getUnsynchronized(): Promise<string[]>;
  abstract processQueue(): Promise<void>;
  abstract queueUpdateTaskHistory(history: DTOTaskHistory): Promise<any>;
  abstract queueInsertTaskHistory(history: DTOTaskHistory): Promise<any>;
  abstract queueUpdateCalendarTasks(tasks: DTOCalendarTask[], synced: boolean): Promise<any>;
  abstract queueUpdateCalendarTask(task: DTOCalendarTask, synced: boolean): Promise<any>;
  abstract queueInsertCalendarTask(task: DTOCalendarTask): Promise<any>;
  abstract queueInsertCalendarTasks(tasks: DTOCalendarTask[]): Promise<any>;
  abstract queueInsertTimer(timer: DTOTaskTimer): Promise<any>;
  abstract queueUpdateTimer(timer: DTOTaskTimer): Promise<any>;
  abstract queueInsertGroup(group: DTOTaskGroup): Promise<any>;
  abstract queueUpdateGroup(group: DTOTaskGroup, synced: boolean): Promise<any>;
  abstract queueUpdateGroups(groups: DTOTaskGroup[], synced: boolean): Promise<any>;
}
