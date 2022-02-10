import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { TimerService } from 'src/app/services/timer.service';
import { TaskTimer } from 'src/app/models/Core/task-timer';
import { ILogger } from 'src/app/interfaces/i-logger';
import { EventService } from 'src/app/services/event.service';
import { DateService } from 'src/app/services/date.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss'],
})
export class TimerComponent implements OnInit, OnDestroy {

  @Input() currentTaskId: string;

  public currentTimerObject: TaskTimer;
  private subscriptions: Subscription[] = [];

  constructor(private timerService: TimerService,
              private eventService: EventService,
              private dateService: DateService,
              private logger: ILogger) { }

  async ngOnInit() {
    // console.log('INIT TIMER',  this.startEvent);
    // this.logger.logDebug('[6] TIMER ' + this.currentTaskId + ' INIT STARTED', new Date().toISOString());

    this.currentTimerObject = new TaskTimer(this.currentTaskId, this.dateService.currentWorkDate);

    this.subscriptions.push(this.eventService.on(EventService.EventIds.TimerStart + this.currentTaskId, (seconds) => {
      this.startTimer(seconds);
    }));

    this.subscriptions.push(this.eventService.on(EventService.EventIds.TimerPause + this.currentTaskId, async () => {
      await this.pauseTimer();
    }));

    this.subscriptions.push(this.eventService.on(EventService.EventIds.TimerUnpause + this.currentTaskId, async () => {
      await this.resumeTimer();
    }));

    // Resume timer is handled in the card component
    /*this.eventService.on(EventService.EventIds.TimerResume + this.currentTaskId, async () => {
      await this.resumeTimer();
    });*/

    this.subscriptions.push(this.eventService.on(EventService.EventIds.TimerComplete + this.currentTaskId, async () => {
      await this.completeTimer();
    }));

    this.subscriptions.push(this.eventService.on(EventService.EventIds.TimerCancel + this.currentTaskId, async () => {
      await this.cancelTimer();
    }));

    this.subscriptions.push(this.eventService.on(EventService.EventIds.DateChanged, async (date: Date) => {
      await this.getTimer(date);
    }));

    // this.logger.logDebug('[7] TIMER ' + this.currentTaskId + ' INIT DONE', new Date().toISOString());

    await this.getTimer(this.dateService.currentWorkDate);
  }

  ngOnDestroy(): void {
    for (const sub of this.subscriptions) {
      sub.unsubscribe();
    }
  }

  private async getTimer(date: Date): Promise<void> {
    // console.log('GET TIMER');
    const timer = await this.timerService.getTimer(date, this.currentTaskId);
    // console.log('GOT TIMER', timer);
    if (timer != null) {
      this.logger.logDebug('GOT TIMER');
      // this.logger.logDebug('GOT TIMER ', JSON.stringify(timer));
      // console.log('TIMER RETRIEVED ' + this.currentTaskId, timer);

      this.currentTimerObject = timer;
    } else {
      // console.log('TIMER NOT RETRIEVED ' + this.currentTaskId);
      // We still have to initialize an empty timer object or else it doesnt work
      this.currentTimerObject = new TaskTimer(this.currentTaskId, date);
    }
  }

  private startTimer(initialSeconds: number): void {
    // console.log('STARTING TIMER', initialSeconds);
    this.logger.logDebug('START TIMER ' + this.currentTaskId);
    this.currentTimerObject = new TaskTimer(this.currentTaskId, this.dateService.currentWorkDate);
    this.currentTimerObject.currentTimerSeconds = initialSeconds;
    this.currentTimerObject.start();
    this.timerService.addTimer(this.currentTimerObject);
    // console.log('currenttimer2', this.currentTimerObject);
  }

  private async resumeTimer() {
    // console.log('RESUME TIMER');
    this.logger.logDebug('RESUME TIMER ' + this.currentTaskId);
    // console.log('Resumed timer', this.currentTimerObject);
    this.currentTimerObject.resume();
    await this.timerService.updateTimer(this.currentTimerObject);
    // console.log('currenttimer2', this.currentTimerObject);
  }

  private async pauseTimer() {
    // console.log('PAUSE TIMER');
    this.logger.logDebug('PAUSE TIMER ' + this.currentTaskId);
    this.currentTimerObject.pause();
    await this.timerService.updateTimer(this.currentTimerObject);
    // console.log('currenttimer2', this.currentTimerObject);
  }

  private async completeTimer() {
    // console.log('STOP TIMER');
    this.logger.logDebug('STOP TIMER ' + this.currentTaskId);
    this.currentTimerObject.complete();
    await this.timerService.updateTimer(this.currentTimerObject);
    // console.log('currenttimer2', this.currentTimerObject);
  }

  private async cancelTimer() {
    // console.log('CANCEL TIMER');
    this.logger.logDebug('CANCEL TIMER ' + this.currentTaskId);
    // console.log('currenttimer1', this.currentTimerObject);
    this.currentTimerObject.cancel();
    await this.timerService.voidTimer(this.currentTimerObject);
    // console.log('currenttimer2', this.currentTimerObject);
  }
}
