import NumberUtils from 'src/app/shared/number-utils';
import { DTOTaskTimer } from '../DTO/dto-timer';
import { Subscription, timer as Timer } from 'rxjs';
import { Inject, Injectable, OnDestroy } from '@angular/core';

@Injectable()
export class TaskTimer implements OnDestroy {
  public TimerId: string;
  public CalendarTaskId: string;
  public TimerDate: Date;
  public StartDate: Date;
  public currentTimerSeconds: number;
  public isPaused: boolean;
  public deltaDelay: number;
  public isDone: boolean;
  public isStarted: boolean;
  public isKeepLongTimer: boolean; // if timer is > x hours, we ask user if he wants to keep it
  public isVoid: boolean;
  public timerSubscription: Subscription;

  public constructor(@Inject(String) calendarTaskId: string, @Inject(Date) currentWorkDate: Date) {
    this.currentTimerSeconds = 0;
    this.deltaDelay = 1;
    this.isPaused = false;
    this.isDone = false;
    this.isStarted = false;
    this.isVoid = false;
    this.TimerId = NumberUtils.getRandomId();
    this.CalendarTaskId = calendarTaskId;
    this.TimerDate = currentWorkDate;
    this.isKeepLongTimer = false;
  }

  public static fromDTO(dto: DTOTaskTimer): TaskTimer {
    const timerDate = dto.TimerDate == null ? null : new Date(dto.TimerDate);

    const timer = new TaskTimer(dto.CalendarTaskId, timerDate);
    timer.TimerDate = dto.TimerDate == null ? null : new Date(dto.TimerDate);
    timer.StartDate = dto.StartDate == null ? null : new Date(dto.StartDate);
    timer.TimerId = dto.TimerId;
    timer.currentTimerSeconds = dto.currentTimerSeconds;
    timer.deltaDelay = dto.deltaDelay;
    timer.isDone = dto.isDone;
    timer.isPaused = dto.isPaused;
    timer.isVoid = dto.isVoid;
    timer.isStarted = true; // We only save started timers
    timer.isKeepLongTimer = dto.isKeepLongTimer;

    return timer;
  }

  ngOnDestroy(): void {
    this.unsubscribeTimerIfExists();
  }

  public toDTO(): DTOTaskTimer {
    const task = new DTOTaskTimer();
    task.CalendarTaskId = this.CalendarTaskId;
    task.TimerDate = this.TimerDate == null ? null : this.TimerDate.toISOString();
    task.StartDate = this.StartDate == null ? null : this.StartDate.toISOString();
    task.TimerId = this.TimerId;
    task.currentTimerSeconds = this.currentTimerSeconds;
    task.deltaDelay = this.deltaDelay;
    task.isDone = this.isDone;
    task.isVoid = this.isVoid;
    task.isPaused = this.isPaused;
    task.isKeepLongTimer = this.isKeepLongTimer;

    return task;
  }

  public start(): void {
    this.isStarted = true;
    this.isPaused = false;
    this.timerSubscription = this.startJsTimer();
  }

  public resume(): void {
    // console.log('RESUMING', this.currentTimerSeconds);

    this.timerSubscription = this.startJsTimer();

    this.isPaused = false;
    this.isDone = false;
  }

  public pause(): void {
    this.unsubscribeTimerIfExists();
    this.isPaused = true;
  }

  public cancel(): void {
    this.unsubscribeTimerIfExists();
    this.isPaused = true;
    this.isDone = true;
    this.isVoid = true;
    this.currentTimerSeconds = 0;
  }

  public complete(): void {
    this.unsubscribeTimerIfExists();
    this.isDone = true;
    this.isPaused = true;
  }

  public isInitialized(): boolean {
    return this.currentTimerSeconds !== 0 ||
           this.isDone !== false ||
           this.isPaused !== false;
  }

  private startJsTimer(): Subscription {
    this.StartDate = new Date();
    // console.log('new start date, initial seconds', this.StartDate, this.currentTimerSeconds);

    const initialTimerSeconds = this.currentTimerSeconds > 0 ?
                                  this.currentTimerSeconds :
                                  0;

    // console.log('INITIAL TIMER SECONDS ', initialTimerSeconds);

    return Timer(1000, 1000).subscribe(ellapsedCycles => {
      const currentTimeStamp = Math.floor(Date.now() / 1000);
      const startTimeStamp = Math.floor(this.StartDate.getTime() / 1000);
      const timeStampDifferenceSeconds = currentTimeStamp - startTimeStamp + initialTimerSeconds;
      const delaySeconds = Math.abs(timeStampDifferenceSeconds - this.currentTimerSeconds);
      // console.log('currentTimestamp = ', currentTimeStamp);
      // console.log('startTimestamp = ', startTimeStamp);
      // console.log('timeStampDifferenceSeconds = ', timeStampDifferenceSeconds);
      // console.log('difference delay seconds : ', delaySeconds);

      if (delaySeconds > 1) {
        // console.log('delay > 1, adjusting : ', timeStampDifferenceSeconds);
        this.currentTimerSeconds = timeStampDifferenceSeconds;
      } else {
        this.currentTimerSeconds ++;
        // console.log('ellapsedCylces : ', ellapsedCycles, this.currentTimerSeconds);
      }
    });
  }

  private unsubscribeTimerIfExists() {
    if (this.timerSubscription != null) {
      this.timerSubscription.unsubscribe();
    }
  }
}
