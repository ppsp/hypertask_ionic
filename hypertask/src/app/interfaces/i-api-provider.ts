import { DTOCalendarTask } from '../models/DTO/dto-calendar-task';
import { DTOGetCalendarTaskRequest } from '../models/DTO/dto-get-calendar-task-request';
import { DTOTaskHistory } from '../models/DTO/dto-task-history';
import { DTOBugReport } from '../models/DTO/dto-bug-report';
import { DTOUser } from '../models/DTO/dto-user';
import { DTOTaskGroup } from '../models/DTO/dto-task-group';

export abstract class IApiProvider {
  abstract insertCalendarTasks(tasks: DTOCalendarTask[]): Promise<string[]>;
  abstract updateCalendarTasks(tasks: DTOCalendarTask[]): Promise<boolean>;
  abstract getTasks(request: DTOGetCalendarTaskRequest): Promise<DTOCalendarTask[]>;
  abstract insertTaskHistories(histories: DTOTaskHistory[]): Promise<string[]>;
  abstract updateTaskHistories(histories: DTOTaskHistory[]): Promise<boolean>;
  abstract sendReport(report: DTOBugReport): Promise<boolean>;
  abstract getUser(userId: string): Promise<DTOUser>;
  abstract saveUser(user: DTOUser): Promise<boolean>;
  abstract getGroups(userId: string): Promise<DTOTaskGroup[]>;
  abstract insertGroup(group: DTOTaskGroup): Promise<boolean>;
  abstract updateGroup(group: DTOTaskGroup): Promise<boolean>;
  abstract downloadAllData(userId: string): Promise<string>;
  abstract permanentlyDeleteAccount(userId: string): Promise<boolean>;
}
