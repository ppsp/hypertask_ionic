import { Injectable } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  public static EventIds = class {
    public static NotificationSyncedFalse = 'NotificationSyncedFalse';
    public static ProgressBar = 'ProgressBar';
    public static DateChanged = 'DateChanged';
    public static SkipAllGroup = 'SkipAllGroup';
    public static PostponeAllGroup = 'PostponeAllGroup';
    public static CardReset = 'CardReset';
    public static ToggleDragAndDrop = 'ToggleDragAndDrop';
    public static TimerCancel = 'TimerCancel';
    public static TimerComplete = 'TimerComplete';
    public static TimerUnpause = 'TimerUnpause';
    public static TimerResume = 'TimerResume';
    public static TimerStart = 'TimerStart';
    public static TimerPause = 'TimerPause';
    public static ShowStats = 'ShowStats';
    public static LanguageChanged = 'LanguageChanged';
    public static Walkthrough = 'Walkthrough';
    public static Resume = 'Resume';
    public static HideStats = 'HideStats';
    public static SkipAll = 'SkipAll';
    public static SyncRequired = 'SyncRequired';
    public static SkipTask = 'SkipTask';
    public static PostponeTask = 'PostponeTask';
    public static DeleteTask = 'DeleteTask';
    // public static EnableNotifications = 'DeleteTask';
    public static LocalSyncCompleted = 'LocalSyncCompleted';
    public static ServerSyncCompleted = 'ServerSyncCompleted';
  };

  private subject$ = new Subject();

  constructor() { }

  public emit(event: EventData) {
    this.subject$.next(event);
  }

  public on(eventName: string, action: any): Subscription {
    return this.subject$.pipe(
      filter( (e: EventData) => e.name === eventName),
      map( (e: EventData) => e.value)).subscribe(action);
  }
}

export class EventData {
  name: string;
  value: any;
  constructor(name, value) {
      this.name = name;
      this.value = value;
  }
}
