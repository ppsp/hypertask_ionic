export class DTOTaskHistory {
  CalendarTaskId: string;
  TaskHistoryId: string;
  TaskDone: boolean;
  UserId: string;
  TaskSkipped: boolean;
  TaskResult: any;
  DoneDate: string;
  DoneWorkDate: string;
  Void: boolean = false;
  InsertDate: string;
  UpdateDate: string;
  VoidDate: string;
  Comment: string;

  Synced: boolean = false;
  Sent: boolean = false;

  public static fromAny(obj: any): DTOTaskHistory {
    const newHistory = new DTOTaskHistory();
    newHistory.CalendarTaskId = obj.CalendarTaskId;
    newHistory.DoneDate = obj.DoneDate;
    newHistory.InsertDate = obj.InsertDate;
    newHistory.Sent = obj.Sent;
    newHistory.Synced = obj.Synced;
    newHistory.TaskDone = obj.TaskDone;
    newHistory.TaskHistoryId = obj.TaskHistoryId;
    newHistory.TaskResult = obj.TaskResult;
    newHistory.TaskSkipped = obj.TaskSkipped;
    newHistory.UpdateDate = obj.UpdateDate;
    newHistory.UserId = obj.UserId;
    newHistory.Void = obj.Void;
    newHistory.VoidDate = obj.VoidDate;
    newHistory.Comment = obj.Comment;
    newHistory.DoneWorkDate = obj.DoneWorkDate; // TODO: Not sure about this

    return newHistory;
  }
}
