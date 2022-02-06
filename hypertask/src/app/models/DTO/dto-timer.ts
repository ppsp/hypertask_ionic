export class DTOTaskTimer {
  public TimerId: string;
  public CalendarTaskId: string;
  public TimerDate: string;
  public StartDate: string;
  public currentTimerSeconds: number;
  public isPaused: boolean;
  public timeStamp: number;
  public deltaDelay: number;
  public isDone: boolean;
  public isSynced: boolean;
  public isSent: boolean;
  public isVoid: boolean;
  public isKeepLongTimer: boolean; // if timer is > x hours, we ask user if he wants to keep it
}
