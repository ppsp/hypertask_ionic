import { Component, OnInit, Input, ViewChild, OnDestroy } from '@angular/core';
import NumberUtils from 'src/app/shared/number-utils';
import { Chart } from 'chart.js';
import { ResultType } from 'src/app/models/Core/result-type.enum';
import { TaskStats } from 'src/app/models/Core/task-stat';
import { TranslateService } from '@ngx-translate/core';
import DateUtils from 'src/app/shared/date-utils';
import { Observable, Subscription } from 'rxjs';
import { DateService } from 'src/app/services/date.service';
import { StatType } from 'src/app/models/Core/custom-stat.enum';
import { UserService } from 'src/app/services/user.service';
import { UserConfig } from 'src/app/models/Core/user-config';
import { ILogger } from 'src/app/interfaces/i-logger';
import { EventData, EventService } from 'src/app/services/event.service';

export class ChartPoint {
  X: string;
  Y: number;
}

@Component({
  selector: 'app-task-scores',
  templateUrl: './task-scores.component.html',
  styleUrls: ['./task-scores.component.scss'],
})
export class TaskScoresComponent implements OnInit, OnDestroy {

  private loadSubscription: Subscription;
  private loaded: boolean = false;

  @Input() calendarTaskId: number;
  @Input() taskStats: TaskStats;
  @Input() loadEvent: Observable<void>;

  @ViewChild('lineChart') lineChart;

  public lines: any;
  public colorArray: any;

  public minusDaysArray: number [] = [6, 5, 4, 3, 2, 1, 0];
  public minusWeeksArray: number [] = [];
  public cardsMinusWeeksArray: number [] = [];
  public showChart: boolean;
  public showDetails: boolean;
  public show1AButton: boolean;
  public showAverage: boolean;
  public showTotal: boolean;
  public showMax: boolean;
  public showCharVsDetails: boolean;
  public showCompletionRate: boolean;
  public txtMaximum: string;
  public txtAverage: string;
  public txtTotal: string;
  public txtCompletionRate: string;

  constructor(private translate: TranslateService,
              public dateService: DateService,
              private userService: UserService,
              private logger: ILogger,
              private eventService: EventService) { }

  ngOnInit() {
    // console.log('[3] SCORES ' + this.taskStats.Name + ' INIT STARTED', new Date().toISOString());
    this.loadSubscription = this.loadEvent.subscribe(() => this.loadStats());
    this.showCharVsDetails = this.taskStats.resultType !== ResultType.Binary;
    this.showChart = this.taskStats.resultType !== ResultType.Binary;
    this.show1AButton = this.taskStats.resultType !== ResultType.Binary;
    this.showAverage = this.taskStats.resultType !== ResultType.Binary;
    this.showTotal = this.taskStats.resultType !== ResultType.Binary &&
                    this.taskStats.resultType !== ResultType.TimeOfDay;
    this.showMax = this.taskStats.resultType !== ResultType.Binary &&
                  this.taskStats.resultType !== ResultType.TimeOfDay;
    this.showDetails = this.taskStats.resultType === ResultType.Binary;
    this.showCompletionRate = true;

    /*if (this.taskStats.Name === 'Wim Hof 3') {
      console.log('{}{}{} STATS', this.taskStats);
    }*/
    // this.logger.logDebug('[4] SCORES ' + this.taskStats.Name + ' INIT ENDED', new Date().toISOString());
  }

  ngOnDestroy() {
    this.loadSubscription.unsubscribe();
  }

  private loadStats(): void {
    // console.log('loadstats3');
    if (this.loaded) {
      return;
    }

    // console.log('loading stats', new Date().toISOString());
    this.btnStatsClick(7);
    this.loaded = true;
    // console.log('stats loaded', new Date().toISOString());
  }

  public showSkipped(minusDays): boolean {
    // console.log('showSkipped', this.previousDaySkipped(minusDays));
    return this.previousDaySkipped(minusDays);
  }

  public showCheckbox(minusDays): boolean {
    // console.log('showcheckbox');
    return this.taskStats.resultType === ResultType.Binary &&
           this.previousDayDone(minusDays);
  }

  public btnCloseStatsClick() {
    this.eventService.emit(new EventData(EventService.EventIds.HideStats + this.calendarTaskId, true));
  }

  public showTime(minusDays): boolean {
    // console.log('showTime');
    return this.taskStats.resultType === ResultType.TimeOfDay &&
            this.previousDayDone(minusDays);
  }

  public showDuration(minusDays): boolean {
    // console.log('SHOW DURATION MINUSDAYS', minusDays);

    // const showit = this.taskStats.resultType === ResultType.Duration && this.previousDayDone(minusDays);
    // console.log('showduration', showit);
    return this.taskStats.resultType === ResultType.Duration && this.previousDayDone(minusDays);
  }

  public showDecimal(minusDays): boolean {
    // console.log('showdecimal');
    return this.taskStats.resultType === ResultType.Decimal && this.previousDayDone(minusDays);
  }

  public btnStatsClick(daysBehind: number): void {
    // console.log('btnStatsClick', daysBehind, this.taskStats);
    this.minusWeeksArray = [];
    this.cardsMinusWeeksArray = [];

    // console.log('STATS INSERT DATE', this.taskStats.TaskInsertWorkDate);
    const maximumDaysBehind = -1 * DateUtils.daysBetween(this.dateService.currentWorkDate, this.taskStats.TaskInsertWorkDate);
    // console.log('MAXIMUM DAYS BEHIND', maximumDaysBehind, daysBehind);
    if (daysBehind > maximumDaysBehind) {
      // console.log('REDUCE DAYSBEHIND TO ', maximumDaysBehind);
      daysBehind = maximumDaysBehind;
    }

    let weeksBehind: number = Math.floor(daysBehind / 7);
    if (weeksBehind === 0) {
      weeksBehind = 1;
    }
    // console.log('weeksbehind', weeksBehind);
    // console.log('minusWeeksArray', this.minusWeeksArray);

    if (weeksBehind < this.taskStats.MinusWeeksArray.length) {
      // console.log('weeksBehind smaller than this.taskStats.MinusWeeksArray.length');
      for (let i = 0; i < weeksBehind; i++) {
        this.minusWeeksArray.push(weeksBehind - i - 1);
        if (this.taskStats.resultType === ResultType.Binary || i < 12) {
          if (this.taskStats.resultType !== ResultType.Binary) {
            const maxWeeksbehind = Math.min(12, weeksBehind);
            this.cardsMinusWeeksArray.push(maxWeeksbehind - i - 1);
            // this.cardsMinusWeeksArray.push(11 - i);
          } else {
            this.cardsMinusWeeksArray.push(weeksBehind - i - 1);
          }
        }
      }

      // console.log('this.minusWeeksArray', this.minusWeeksArray);
      // console.log('this.cardsMinusWeeksArray', this.cardsMinusWeeksArray);
    } else {
      // console.log('weeksBehind NOT smaller than this.taskStats.MinusWeeksArray.length');

      this.minusWeeksArray = this.taskStats.MinusWeeksArray;
      daysBehind = this.taskStats.MinusWeeksArray.length * 7;
      this.cardsMinusWeeksArray = this.minusWeeksArray.filter(p => p < 12);

      // console.log('this.cardsMinusWeeksArray2', this.cardsMinusWeeksArray);
      // console.log('this.minusWeeksArray', this.minusWeeksArray);
    }

    // We want the first date of stats to be the task insert date

    if (this.taskStats.resultType === ResultType.Decimal) {
      this.createDecimalChart(daysBehind);
    } else if (this.taskStats.resultType === ResultType.Duration) {
      this.createDurationChart(daysBehind);
    } else if (this.taskStats.resultType === ResultType.TimeOfDay) {
      this.createTimeChart(daysBehind);
    } else if (this.taskStats.resultType === ResultType.Binary) {
      this.createBinaryChart(daysBehind);
    }
  }

  public getPreviousDayResult(minusDays: number): string {
    const result = this.taskStats.results[this.taskStats.results.length - minusDays - 1];

    if (result != null) {
        return String(result);
    } else {
      return ' n/a ';
    }
  }

  public getPreviousDayDuration(minusDays: number): string {
    const result = this.taskStats.results[this.taskStats.results.length - minusDays - 1];

    // console.log('previousdayduration = ', result, this.taskStats.results);

    if (result != null && Number(result) > 0) {
        return this.getShortDurationString(Number(result));
    } else {
      return ' n/a ';
    }
  }

  public getPreviousDayDone(minusDays: number): boolean {
    const result = this.taskStats.doneDays[this.taskStats.doneDays.length - minusDays - 1];

    if (result != null) {
        return result;
    } else {
      return false;
    }
  }

  public getShortDurationString(totalSeconds: number): string {
    if (totalSeconds != null) {
      const hours = DateUtils.getHoursFromSeconds(totalSeconds);
      const minutes = DateUtils.getMinutesFromSeconds(totalSeconds);
      const seconds = totalSeconds - DateUtils.SecondsInMinute * minutes - hours * DateUtils.SecondsInHour;
      const secondsString = seconds > 10 ? String(seconds) : '0' + seconds;
      const minutesString = minutes > 10 ? String(minutes) : '0' + minutes;

      if (hours === 0 && minutes < 1) {
        return '00:' + secondsString;
      } else if (hours === 0) {
        return minutes + ':' + secondsString;
      } else {
        return hours + ':' + minutesString;
      }
    } else {
      return '';
    }
  }

  public chartChanged(event: any) {
    if (event.detail.value === 'Chart') {
      this.showChart = true;
      this.showDetails = false;
    } else {
      this.showChart = false;
      this.showDetails = true;
    }
  }

  private previousDaySkipped(minusDays: number): boolean {
    if (this.taskStats.skippedDays.length < minusDays + 1) {
      // throw Error('minusDays is too big ' + minusDays);
      return false;
    }

    // console.log('previousDaySkipped: MinusDays', this.taskStats.skippedDays);
    const result = this.taskStats.skippedDays[this.taskStats.skippedDays.length - minusDays - 1];
    return result;
  }

  private previousDayDone(minusDays: number): boolean {
    if (this.taskStats.doneDays.length < minusDays + 1) {
      // throw Error('minusDays is too big ' + minusDays);
      return false;
    }

    const result = this.taskStats.doneDays[this.taskStats.doneDays.length - minusDays - 1];
    return result;
  }

  private getPreviousDayTimeResultHours(minusDays: number): number {
    // console.log('getPreviousDayTimeResultHours: MinusDays', minusDays);
    const result = this.taskStats.results[this.taskStats.results.length - minusDays - 1];

    if (result != null) {
      let hours = Number(result.substring(0, 2));
      const minutes = Number(result.substring(3));

      if (this.taskStats.StatType === StatType.TimeSleep) {
        const endOfDayTime = this.userService.getConfig(UserConfig.EndOfDayTimeKey);
        const endOfDayHours = Number(endOfDayTime.substring(0, 2));
        if (hours < endOfDayHours) {
          hours += 24;
        }
      }

      return hours + (minutes / 60);
    } else {
      return 0;
    }
  }

  private createDecimalChart(minusDays: number) {
    const chartPoints: ChartPoint[] = this.getDecimalChartPoints(minusDays);

    this.lines = new Chart(this.lineChart.nativeElement, {
      type: 'line',
      data: {
        labels: chartPoints.map(p => p.X),
        datasets: [{
          data: chartPoints.map(p => p.Y),
          fill: false,
          backgroundColor: 'rgb(255, 255, 255)',
          borderColor: 'rgb(0, 0, 0)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        },
        legend: {
          display: false
        },
      }
    });
  }

  private createDurationChart(minusDays: number) {
    const chartPoints: ChartPoint[] = this.getDurationChartPoints(minusDays);
    // console.log('chartpoints');

    const maxTime = Math.max(...chartPoints.map(p => p.Y));
    let myLabel = this.translate.instant('task-scores.lbl-minutes');
    if (maxTime > 60) {
      myLabel = this.translate.instant('task-scores.lbl-hours');
      chartPoints.forEach(p => p.Y = p.Y / 60);
    }

    this.lines = new Chart(this.lineChart.nativeElement, {
      type: 'line',
      data: {
        labels: chartPoints.map(p => p.X),
        datasets: [{
          data: chartPoints.map(p => p.Y),
          fill: false,
          backgroundColor: 'rgb(255, 255, 255)',
          borderColor: 'rgb(0, 0, 0)',
          borderWidth: 1
        }]
      },
      options: {
        title: {
          display: true,
          text: myLabel,
        },
        legend: {
          display: false
        },
      }
    });
  }

  private createTimeChart(minusDays: number) {
    const chartPoints: ChartPoint[] = this.getTimeChartPoints(minusDays);
    this.lines = new Chart(this.lineChart.nativeElement, {
      type: 'line',
      data: {
        labels: chartPoints.map(p => p.X),
        datasets: [{
          data: chartPoints.map(p => p.Y),
          fill: false,
          backgroundColor: 'rgb(255, 255, 255)',
          borderColor: 'rgb(0, 0, 0)',
          borderWidth: 1
        }]
      },
      options: {
        title: {
          display: true,
          text: this.translate.instant('task-scores.lbl-time'),
        },
        legend: {
          display: false
        },
      }
    });
  }


  private createBinaryChart(minusDays: number) {
    // console.log('createBinaryChart', minusDays);
    const chartPoints: ChartPoint[] = this.getBinaryChartPoints(minusDays);
    // console.log('chartpoints', chartPoints);

    const completed = chartPoints.filter(p => p.Y > 0).length;
    // console.log('completed', chartPoints.filter(p => p.Y > 0));

    if (chartPoints.length > 0) {
      const percentage = ' (' + (100.0 * completed / chartPoints.length).toFixed(1) + '%)';

      this.txtCompletionRate = completed.toString() + '/' + chartPoints.length.toString() + percentage;
      // console.log('txtCompletionRate', this.txtCompletionRate);
    } else {
      this.txtCompletionRate = '';
    }
  }

  private getDecimalChartPoints(minusDays: number): ChartPoint[] {
    // console.log('getDecimalChartPoints', this.currentWorkDate);
    const chartPoints: ChartPoint[] = [];

    for (const plusDay of NumberUtils.Range(-minusDays, 0, 1)) {
      const chartPoint = this.getDecimalChartPoint(plusDay);
      chartPoints.push(chartPoint);
    }

    this.setStatsStringsDecimal(chartPoints);

    return chartPoints;
  }

  private setStatsStringsDecimal(chartPoints: ChartPoint[]) {
    // Max
    const yValues = chartPoints.map(p => Number(p.Y))
      .filter(p => p > 0);
    // console.log('numbers', numbers);
    // console.log('max', Math.max.apply(Math, numbers));
    if (yValues.length > 0) {
      this.txtMaximum = String(Math.max.apply(Math, yValues));
    } else {
      this.txtMaximum = '0';
    }

    // Total
    const sum = yValues.reduce((a, b) => a + b, 0);
    // console.log('sum', sum.toFixed(1));
    this.txtTotal = sum.toFixed(1);
    // Average
    const avg = (sum / yValues.length) || 0;
    this.txtAverage = avg.toFixed(1);

    const completed = yValues.filter(p => p > 0).length;
    // console.log('completed', yValues.filter(p => p > 0));

    if (yValues.length > 0) {
      const percentage = ' (' + (100.0 * completed / chartPoints.length).toFixed(1) + '%)';

      this.txtCompletionRate = completed.toString() + '/' + chartPoints.length.toString() + percentage;
      // console.log('chartPoints.length', chartPoints.length);
      // console.log('txtCompletionRate', this.txtCompletionRate);
    } else {
      this.txtCompletionRate = '';
    }
  }

  private getDurationChartPoints(minusDays: number): ChartPoint[] {
    // console.log('getDurationChartPoints', this.currentWorkDate);
    const chartPoints: ChartPoint[] = [];

    for (const plusDay of NumberUtils.Range(-minusDays, 0, 1)) {
      const chartPoint = this.getDurationChartPoint(plusDay);
      chartPoints.push(chartPoint);
    }

    this.setStatsStringsDuration(chartPoints);

    return chartPoints;
  }

  private setStatsStringsDuration(chartPoints: ChartPoint[]) {
    // Max
    const numbers = chartPoints.map(p => Number(p.Y / 60))
      .filter(p => p > 0);
    // console.log('numbers', numbers);
    // console.log('chartPoints', chartPoints);
    if (numbers.length > 0) {
      this.txtMaximum = Math.max.apply(Math, numbers).toFixed(2) + ' ' +
                        this.translate.instant('task-scores.lbl-hours');
    } else {
      this.txtMaximum = 0 + ' ' + this.translate.instant('task-scores.lbl-hours');
    }

    // Total
    const sum = numbers.reduce((a, b) => a + b, 0);
    this.txtTotal = sum.toFixed(1) + ' ' + this.translate.instant('task-scores.lbl-hours');
    // Average
    const avg = (sum / numbers.length) || 0;
    this.txtAverage = avg.toFixed(1) + ' ' + this.translate.instant('task-scores.lbl-hours');

    const completed = chartPoints.filter(p => p.Y > 0).length;
    // console.log('completed', chartPoints.filter(p => p.Y > 0));

    if (chartPoints.length > 0) {
      const percentage = ' (' + (100.0 * completed / chartPoints.length).toFixed(1) + '%)';

      this.txtCompletionRate = completed.toString() + '/' + chartPoints.length.toString() + percentage;
      // console.log('txtCompletionRate', this.txtCompletionRate);
    } else {
      this.txtCompletionRate = '';
    }
  }

  private getTimeChartPoints(minusDays: number): ChartPoint[] {
    // console.log('getTimeChartPoints', this.currentWorkDate);
    const chartPoints: ChartPoint[] = [];

    // console.log('before range minusdays', minusDays);
    // console.log('before range start', -minusDays);
    // console.log('range=', NumberUtils.Range(-minusDays, 0, 1));

    for (const plusDay of NumberUtils.Range(-minusDays, 0, 1)) {
      const chartPoint = this.getTimeChartPoint(plusDay);
      chartPoints.push(chartPoint);
    }

    this.setStatsStringsTime(chartPoints);

    return chartPoints;
  }

  private getBinaryChartPoints(minusDays: number): ChartPoint[] {
    const chartPoints: ChartPoint[] = [];

    // console.log('before range minusdays', minusDays);
    // console.log('before range start', -minusDays);
    // console.log('range=', NumberUtils.Range(-minusDays, 0, 1));

    for (const plusDay of NumberUtils.Range(-minusDays, 0, 1)) {
      const chartPoint = this.getBinaryChartPoint(plusDay);
      chartPoints.push(chartPoint);
    }

    // console.log('points pushed');

    this.setStatsStringsDecimal(chartPoints);

    return chartPoints;
  }

  private setStatsStringsTime(chartPoints: ChartPoint[]) {
    // Max
    const numbers = chartPoints.map(p => Number(p.Y))
      .filter(p => p > 0);
    if (numbers.length > 0) {
      this.txtMaximum = Math.max.apply(Math, numbers).toFixed(2);
    } else {
      this.txtMaximum = '';
    }

    // Total
    const sum = numbers.reduce((a, b) => a + b, 0);
    this.txtTotal = sum.toFixed(1);
    // Average
    const avg = (sum / numbers.length) || 0;
    this.txtAverage = avg.toFixed(1);

    const completed = chartPoints.filter(p => p.Y > 0).length;
    // console.log('completed', chartPoints.filter(p => p.Y > 0));

    if (chartPoints.length > 0) {
      const percentage = ' (' + (100.0 * completed / chartPoints.length).toFixed(1) + '%)';

      this.txtCompletionRate = completed.toString() + '/' + chartPoints.length.toString() + percentage;
      // console.log('txtCompletionRate', this.txtCompletionRate);
    } else {
      this.txtCompletionRate = '';
    }
  }

  private getTimeChartPoint(plusDay: number) {
    const chartPoint = new ChartPoint();
    chartPoint.X = this.dateService.GetmmddFromMinusDays(-plusDay, this.dateService.currentWorkDate);
    const result = this.getPreviousDayTimeResultHours(-plusDay);
    if (result != null && result > 0) {
      chartPoint.Y = result;
    } else {
      chartPoint.Y = null;
    }
    return chartPoint;
  }

  private getDurationChartPoint(plusDay: number) {
    // console.log('getting durationchartpoint');
    const chartPoint = new ChartPoint();
    chartPoint.X = this.dateService.GetmmddFromMinusDays(-plusDay, this.dateService.currentWorkDate);
    const result = this.getPreviousDayResult(-plusDay);
    if (result != null && Number(result) > 0) {
      chartPoint.Y = Number(result) / 60;
    } else {
      chartPoint.Y = 0;
    }
    return chartPoint;
  }

  private getDecimalChartPoint(plusDay: number) {
    const chartPoint = new ChartPoint();
    chartPoint.X = this.dateService.GetmmddFromMinusDays(-plusDay, this.dateService.currentWorkDate);
    const result = Number(this.getPreviousDayResult(-plusDay));
    if (result != null && result > 0) {
      chartPoint.Y = result;
    } else {
      chartPoint.Y = null;
    }
    return chartPoint;
  }

  private getBinaryChartPoint(plusDay: number) {
    const chartPoint = new ChartPoint();
    chartPoint.X = this.dateService.GetmmddFromMinusDays(-plusDay, this.dateService.currentWorkDate);
    const result = this.getPreviousDayDone(-plusDay);
    if (result != null && result === true) {
      chartPoint.Y = 1;
    } else {
      chartPoint.Y = null;
    }
    return chartPoint;
  }
}
