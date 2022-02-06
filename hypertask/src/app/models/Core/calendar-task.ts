import { TaskFrequency } from './task-frequency.enum';
import { ResultType } from './result-type.enum';
import { DayOfWeek } from './day-of-week.enum';
import { TaskHistory } from './task-history';
import DateUtils from '../../shared/date-utils';
import { DTOCalendarTask } from '../DTO/dto-calendar-task';
import { InvalidCalendarTaskError } from '../Exceptions/InvalidCalendarTaskError';
import { StatType } from './custom-stat.enum';
import { TranslateService } from '@ngx-translate/core';

export class CalendarTask {

  Name: string;
  RequiredDays: DayOfWeek[] = [];
  Frequency: TaskFrequency = TaskFrequency.Daily;
  AbsolutePosition: number;
  InitialAbsolutePosition: number;
  ResultType: ResultType = ResultType.Binary;
  UserId: string;
  CalendarTaskId: string;
  Void: boolean = false;
  AssignedDate: Date;
  InsertDate: Date;
  UpdateDate: Date;
  SkipUntil: Date;
  GroupId: string;
  InitialGroupId: string;
  NotificationId: number;
  NotificationTime: string;

  Synced: boolean = false;
  Sent: boolean = false;
  IsShown: boolean = false;

  Histories: TaskHistory[] = [];

  public HistoriesMap: Map<string, TaskHistory[]> = new Map<string, TaskHistory[]>();
  public MinimumStartingMinusDay: number = 365;

  StatType: StatType = StatType.Regular;

  public static equals(task: CalendarTask, task2: CalendarTask): boolean {
    // console.log('equals');
    const result = task2.Name === task.Name &&
           task2.RequiredDays === task.RequiredDays &&
           task2.ResultType === task.ResultType &&
           task2.Frequency === task.Frequency &&
           DateUtils.datesAreEqual(task2.AssignedDate, task.AssignedDate) &&
           task2.AbsolutePosition === task.AbsolutePosition &&
           task2.InitialGroupId === task.InitialGroupId &&
           task2.NotificationId === task.NotificationId &&
           task2.NotificationTime === task.NotificationTime &&
           task2.SkipUntil === task.SkipUntil;

    /*if (result === false) {
      console.log('NOT EQUAL', task, task2);
    }*/

    return result;
  }

  public static fromDTO(dto: DTOCalendarTask): CalendarTask {
    const task = new CalendarTask();
    task.Name = dto.Name;
    task.RequiredDays = dto.RequiredDays;
    task.Frequency = dto.Frequency;
    task.AbsolutePosition = dto.AbsolutePosition;
    task.InitialAbsolutePosition = dto.InitialAbsolutePosition;
    if (task.InitialAbsolutePosition === 500) { // TODO : unfortunate patch that shouldn't be necessary but need to dig why it's 500
      task.InitialAbsolutePosition = task.AbsolutePosition;
    }
    task.ResultType = dto.ResultType;
    task.UserId = dto.UserId;
    task.CalendarTaskId = dto.CalendarTaskId;
    task.Void = dto.Void;
    task.Synced = dto.Synced;
    task.Sent = dto.Sent;
    task.StatType = dto.StatType;
    task.GroupId = dto.GroupId;
    task.InitialGroupId = dto.GroupId; // TODO : Not sure
    task.NotificationId = dto.NotificationId;
    task.NotificationTime = dto.NotificationTime;
    task.InsertDate = dto.InsertDate == null ? null : new Date(dto.InsertDate);
    task.UpdateDate = dto.UpdateDate == null ? null : new Date(dto.UpdateDate);
    task.SkipUntil = dto.SkipUntil == null ? null : new Date(dto.SkipUntil);
    task.AssignedDate = dto.AssignedDate == null ? null : new Date(dto.AssignedDate);

    task.Histories = dto.Histories.map(p => TaskHistory.fromDTO(p));

    return task;
  }

  public toDTO(): DTOCalendarTask {
    const task = new DTOCalendarTask();
    task.Name = this.Name;
    task.RequiredDays = this.RequiredDays;
    task.Frequency = this.Frequency;
    task.AbsolutePosition = this.AbsolutePosition;
    task.InitialAbsolutePosition = this.InitialAbsolutePosition;
    task.ResultType = this.ResultType;
    task.UserId = this.UserId;
    task.CalendarTaskId = this.CalendarTaskId;
    task.NotificationId = this.NotificationId;
    task.NotificationTime = this.NotificationTime;
    task.Void = this.Void;
    task.Synced = this.Synced;
    task.Sent = this.Sent;
    task.StatType = this.StatType;
    task.GroupId = this.GroupId;
    task.InsertDate = this.InsertDate == null ? null : this.InsertDate.toISOString();
    task.UpdateDate = this.UpdateDate == null ? null : this.UpdateDate.toISOString();
    task.SkipUntil = this.SkipUntil == null ? null : this.SkipUntil.toISOString();
    task.AssignedDate = this.AssignedDate == null ? null : this.AssignedDate.toISOString();

    task.Histories = this.Histories.map(p => p.toDTO());

    return task;
  }

  public GetDoneHistoriesNoVoid(workDate: Date): TaskHistory[] {
    // console.log('GetDoneHistoriesNoVoid', workDate);
    if (this.HistoriesMap.size > 0) {
      const result = this.HistoriesMap.get(workDate.toISOString());
      if (result != null) {
        return result;
      } else {
        return [];
      }
    } else {
      return [];
    }
  }

  public isBinary(): boolean { // TODO : This is dangerous because somethings the function is not passed with the object
    return this.ResultType === ResultType.Binary;
  }

  public isDecimal(): boolean { // TODO : This is dangerous because somethings the function is not passed with the object
    return this.ResultType === ResultType.Decimal;
  }

  public isTime(): boolean { // TODO : This is dangerous because somethings the function is not passed with the object
    return this.ResultType === ResultType.TimeOfDay;
  }

  public isDuration(): boolean { // TODO : This is dangerous because somethings the function is not passed with the object
    return this.ResultType === ResultType.Duration;
  }

  public validate(translate: TranslateService) {
    if (this.Name == null || this.Name.length === 0 || this.Name.length > 200) {
      throw new InvalidCalendarTaskError(translate.instant('calendar-task.msg-task-name-invalid'));
    }

    if (this.AbsolutePosition < 0 || this.AbsolutePosition > 500) {
      throw new InvalidCalendarTaskError(translate.instant('calendar-task.msg-invalid-task-position'));
    }

    if ((this.Frequency === TaskFrequency.Once ||
        this.Frequency === TaskFrequency.UntilDone) &&
         this.AssignedDate == null) {
           throw new InvalidCalendarTaskError(translate.instant('calendar-task.msg-required-assigned-date'));
    }

    if (this.Frequency === TaskFrequency.Daily &&
        this.RequiredDays.length === 0) {
          throw new InvalidCalendarTaskError(translate.instant('calendar-task.msg-required-days-required'));
    }
  }
}
