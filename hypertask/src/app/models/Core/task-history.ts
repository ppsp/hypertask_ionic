import { DTOTaskHistory } from '../DTO/dto-task-history';
import DateUtils from 'src/app/shared/date-utils';
import NumberUtils from 'src/app/shared/number-utils';

export class TaskHistory {
  CalendarTaskId: string;
  TaskHistoryId: string;
  TaskDone: boolean;
  UserId: string;
  TaskSkipped: boolean;
  TaskResult: any;
  DoneDate: Date;
  DoneWorkDate: Date;
  Void: boolean = false;
  InsertDate: Date;
  UpdateDate: Date;
  VoidDate: Date;
  Comment: string;

  Synced: boolean = false;
  Sent: boolean = false;

  public static createNew(taskResult: any,
                          taskCompleted: boolean,
                          taskSkipped: boolean,
                          doneDate: Date,
                          workDate: Date,
                          calendarTaskId: string,
                          userId: string): TaskHistory {
    const calendarTaskHistory: TaskHistory = new TaskHistory();
    calendarTaskHistory.InsertDate = new Date();
    calendarTaskHistory.DoneDate = doneDate;
    calendarTaskHistory.DoneWorkDate = workDate;
    calendarTaskHistory.TaskDone = taskCompleted;
    calendarTaskHistory.TaskSkipped = taskSkipped;
    calendarTaskHistory.TaskResult = taskResult;
    calendarTaskHistory.CalendarTaskId = calendarTaskId;
    calendarTaskHistory.UserId = userId;
    calendarTaskHistory.TaskHistoryId = NumberUtils.getRandomId();
    console.log('CREATENEW : ', calendarTaskHistory);
    return calendarTaskHistory;
  }

  public static fromDTO(dto: DTOTaskHistory): TaskHistory {
    const history = new TaskHistory();
    history.CalendarTaskId = dto.CalendarTaskId;
    history.TaskHistoryId = dto.TaskHistoryId;
    history.TaskDone = dto.TaskDone;
    history.UserId = dto.UserId;
    history.TaskSkipped = dto.TaskSkipped;
    history.TaskResult = dto.TaskResult;
    history.DoneDate = dto.DoneDate == null ? null : new Date(dto.DoneDate);
    history.Void = dto.Void;
    history.InsertDate = dto.InsertDate == null ? null : new Date(dto.InsertDate);
    history.UpdateDate = dto.UpdateDate == null ? null : new Date(dto.UpdateDate);
    history.VoidDate = dto.VoidDate == null ? null : new Date(dto.VoidDate);
    history.Synced = dto.Synced;
    history.Sent = dto.Sent;
    history.Comment = dto.Comment;
    //                                                this should not be necessary, need to cleanup database
    history.DoneWorkDate = dto.DoneWorkDate == null ? DateUtils.RemoveHours(new Date(dto.InsertDate)) : new Date(dto.DoneWorkDate);
    return history;
  }

  public toDTO(): DTOTaskHistory {
    const history = new DTOTaskHistory();
    history.CalendarTaskId = this.CalendarTaskId;
    history.TaskHistoryId = this.TaskHistoryId;
    history.TaskDone = this.TaskDone;
    history.UserId = this.UserId;
    history.TaskSkipped = this.TaskSkipped;
    history.TaskResult = this.TaskResult;
    history.DoneDate = this.DoneDate == null ? null : this.DoneDate.toISOString();
    history.Void = this.Void;
    history.InsertDate = this.InsertDate == null ? null : this.InsertDate.toISOString();
    history.UpdateDate = this.UpdateDate == null ? null : this.UpdateDate.toISOString();
    history.VoidDate = this.VoidDate == null ? null : this.VoidDate.toISOString();
    history.Synced = this.Synced;
    history.Sent = this.Sent;
    history.Comment = this.Comment;
    history.DoneWorkDate = this.DoneWorkDate == null ? null : this.DoneWorkDate.toISOString();

    return history;
  }

  public getDurationString(): string {
    if (this.TaskDone) {
      if (typeof(this.TaskResult) === 'number') {
        return DateUtils.getDurationString(this.TaskResult);
      } else {
        return '';
      }
    } else {
      return '';
    }
  }

  public getDurationStringHHmm(): string {
    if (this.TaskDone) {
      let minutes = 0;
      if (typeof(this.TaskResult) === 'number') {
        minutes = Math.round(this.TaskResult / 60);

        const hours = Math.floor(minutes / 60);
        let result = hours < 10 ? '0' + String(hours) : String(hours);
        minutes = minutes - (60 * hours);
        result += ':';
        result += minutes < 10 ? '0' + String(minutes) : String(minutes);
        /*result += 'm';*/
        return result;
      } else {
        return '04:00';
      }
    } else {
      return '04:00';
    }
  }
}
