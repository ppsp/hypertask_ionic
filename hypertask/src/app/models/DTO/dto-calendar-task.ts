import { DayOfWeek } from '../Core/day-of-week.enum';
import { TaskFrequency } from '../Core/task-frequency.enum';
import { ResultType } from '../Core/result-type.enum';
import { DTOTaskHistory } from './dto-task-history';
import { StatType } from '../Core/custom-stat.enum';

export class DTOCalendarTask {
  Name: string;
  Description: string;
  MinDuration: number;
  RequiredDays: DayOfWeek[] = [];
  Frequency: TaskFrequency = TaskFrequency.Daily;
  AbsolutePosition: number;
  InitialAbsolutePosition: number;
  ResultType: ResultType = ResultType.Binary;
  Positive: boolean = true;
  FontAwesomeIcon: string;
  UserId: string;
  CalendarTaskId: string;
  Void: boolean = false;
  AssignedDate: string;
  Reccuring: boolean;
  InsertDate: string;
  UpdateDate: string;
  SkipUntil: string;
  GroupId: string;
  NotificationId: number;
  NotificationTime: string;

  Synced: boolean = false;
  Sent: boolean = false;

  Histories: any[] = [];

  StatType: StatType = StatType.Regular;

  public static fromAny(obj: any): DTOCalendarTask {
    const newTask = new DTOCalendarTask();
    newTask.AbsolutePosition = obj.AbsolutePosition;
    newTask.CalendarTaskId = obj.CalendarTaskId;
    newTask.Description = obj.Description;
    newTask.FontAwesomeIcon = obj.FontAwesomeIcon;
    newTask.Frequency = obj.Frequency;
    newTask.Histories = obj.Histories;
    newTask.InitialAbsolutePosition = obj.InitialAbsolutePosition;
    newTask.MinDuration = obj.MinDuration;
    newTask.Name = obj.Name;
    newTask.Positive = obj.Positive;
    newTask.RequiredDays = obj.RequiredDays;
    newTask.ResultType = obj.ResultType;
    newTask.Sent = obj.Sent;
    newTask.Synced = obj.Synced;
    newTask.UserId = obj.UserId;
    newTask.Void = obj.Void;
    newTask.AssignedDate = obj.AssignedDate;
    newTask.StatType = obj.StatType;
    newTask.InsertDate = obj.InsertDate;
    newTask.UpdateDate = obj.UpdateDate;
    newTask.SkipUntil = obj.SkipUntil;
    newTask.GroupId = obj.GroupId;
    newTask.NotificationId = obj.NotificationId;
    newTask.NotificationTime = obj.NotificationTime;
    newTask.Histories = obj.Histories.map(p => DTOTaskHistory.fromAny(p));
    return newTask;
  }

  public clone(): DTOCalendarTask {
    return DTOCalendarTask.fromAny(this);
  }
}
