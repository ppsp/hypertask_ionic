import { DTOCalendarTask } from '../models/DTO/dto-calendar-task';
import { DTOTaskHistory } from '../models/DTO/dto-task-history';
import { DTOUser } from '../models/DTO/dto-user';
import { DTOTaskTimer } from '../models/DTO/dto-timer';
import { DTOTaskGroup } from '../models/DTO/dto-task-group';

export abstract class ILocalStorageService {
  public static currentlyUsed: boolean = false;
  public Initialized: boolean = false;

  abstract initialize(userId: string): Promise<void>;
  abstract terminate(): Promise<void>;
  abstract setCalendarTasks(tasks: DTOCalendarTask[],
                            alreadyUsed: boolean): Promise<boolean>;
  abstract getCalendarTasks(alreadyUsed: boolean): Promise<DTOCalendarTask[]>;
  abstract insertCalendarTask(task: DTOCalendarTask): Promise<any>;
  abstract insertCalendarTasks(tasks: DTOCalendarTask[]): Promise<any>;
  abstract updateCalendarTask(task: DTOCalendarTask, synced: boolean): Promise<any>;
  abstract updateCalendarTasks(tasks: DTOCalendarTask[], synced: boolean): Promise<any>;
  abstract updateSyncedCalendarTask(task: DTOCalendarTask, alreadyLocked: boolean): Promise<any>;
  abstract insertTaskHistory(history: DTOTaskHistory): Promise<any>;
  abstract insertTaskHistories(histories: DTOTaskHistory[]): Promise<any>;
  abstract updateTaskHistory(history: DTOTaskHistory): Promise<any>;
  abstract updateTaskHistories(histories: DTOTaskHistory[]): Promise<any>;
  abstract updateSyncedTaskHistory(history: DTOTaskHistory, alreadyLocked: boolean): Promise<any>;
  abstract waitForDbAvailable(reason: string): Promise<void>;
  abstract clear(): Promise<void>;
  abstract shouldViewChangeLog(currentVersion: string): Promise<boolean>;
  abstract setChangeLogToViewed(currentVersion: string): Promise<boolean>;
  abstract getUser(userId: string): Promise<DTOUser>;
  abstract setUser(user: DTOUser, alreadyLocked: boolean): Promise<void>;
  abstract getTimers(alreadyReadOnly: boolean): Promise<DTOTaskTimer[]>;
  abstract setTimers(timers: DTOTaskTimer[], alreadyReadOnly: boolean): Promise<void>;
  abstract insertTimer(timer: DTOTaskTimer): Promise<void>;
  abstract updateTimer(timer: DTOTaskTimer): Promise<void>;
  abstract getGroups(alreadyLocked: boolean): Promise<DTOTaskGroup[]>;
  abstract setGroups(groups: DTOTaskGroup[], alreadyReadOnly: boolean): Promise<boolean>;
  abstract setGroupsAndTasks(groups: DTOTaskGroup[], tasks: DTOCalendarTask[]): Promise<boolean>;
  abstract insertGroup(group: DTOTaskGroup): Promise<void>;
  abstract insertGroups(groups: DTOTaskGroup[]): Promise<void>;
  abstract updateGroup(group: DTOTaskGroup, alreadyLocked: boolean): Promise<void>;
  abstract updateGroups(groups: DTOTaskGroup[], alreadyLocked: boolean): Promise<void>;
  abstract updateSyncedGroup(group: DTOTaskGroup): Promise<any>;
}
