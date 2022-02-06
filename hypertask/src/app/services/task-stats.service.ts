import { Injectable } from '@angular/core';
import { TaskStats } from '../models/Core/task-stat';
import { CalendarTaskService } from './calendar-task.service';
import { CalendarTask } from '../models/Core/calendar-task';
import DateUtils from '../shared/date-utils';
import { DatePipe } from '@angular/common';
import { ResultType } from '../models/Core/result-type.enum';
import { StatType } from '../models/Core/custom-stat.enum';
import { TranslateService } from '@ngx-translate/core';
import { TaskHistory } from '../models/Core/task-history';
import { DateService } from './date.service';

@Injectable({
  providedIn: 'root'
})
export class TaskStatsService {

  public minusDaysArray: number [] = [6, 5, 4, 3, 2, 1, 0];

  constructor(private calendarTaskService: CalendarTaskService,
              private datepipe: DatePipe,
              private translate: TranslateService,
              private dateService: DateService) { }

  public getTaskStats(calendarTaskId: string,
                      currentWorkDate: Date,
                      minusWeeks: number): TaskStats {
    // console.log('getTaskStats start', new Date().toISOString());
    const taskStats = new TaskStats();
    const task = this.calendarTaskService.getTask(calendarTaskId);

    taskStats.resultType = task.ResultType;
    taskStats.StartingMinusDays = minusWeeks > 0 ?
                                    task.MinimumStartingMinusDay :
                                    0;
    taskStats.MinusWeeksArray = minusWeeks > 0 ?
                                  this.getMinusWeeksArray(minusWeeks, taskStats.StartingMinusDays) :
                                  [];
    taskStats.Name = task.Name;
    // console.log('-=-=-=- GetTaskStats');
    taskStats.TaskInsertWorkDate = this.dateService.GetWorkDate(task.InsertDate);

    for (const minusWeek of taskStats.MinusWeeksArray) {
      for (const minusDay of this.minusDaysArray) {
        const minusDays = minusWeek * 7 + minusDay;
        // console.log('loop minusDays', minusDays, new Date().toISOString());
        const targetDate = DateUtils.AddDays(currentWorkDate, - minusDays);
        const history = this.calendarTaskService.getTaskHistoryNoVoid(task, targetDate);
        taskStats.results.push(this.getPreviousDayResult(task,
                                                         history));
        taskStats.doneDays.push(this.previousDayDone(history));
        taskStats.skippedDays.push(this.previousDaySkipped(history));
      }
    }

    // console.log('getTaskStats done', new Date().toISOString());

    return taskStats;
  }

  public getCustomStats(currentWorkDate: Date,
                        minusWeeks: number,
                        taskType1: StatType,
                        taskType2: StatType,
                        statName: string): TaskStats {
    const taskStats = new TaskStats();
    const task1 = this.calendarTaskService.getTaskFromStatType(taskType1);
    const task2 = this.calendarTaskService.getTaskFromStatType(taskType2);

    if (task1 == null || task2 == null) {
      return;
    }

    taskStats.Name = statName;
    taskStats.TaskInsertWorkDate = this.dateService.GetWorkDate(task1.InsertDate);
    taskStats.resultType = ResultType.TimeOfDay;
    taskStats.StartingMinusDays = minusWeeks > 0 ?
                                    task1.MinimumStartingMinusDay :
                                    0;
    taskStats.MinusWeeksArray = minusWeeks > 0 ?
                                  this.getMinusWeeksArray(minusWeeks, taskStats.StartingMinusDays) :
                                  [];

    for (const minusWeek of taskStats.MinusWeeksArray) {
      for (const minusDay of this.minusDaysArray) {

        const minusDaysUp = minusWeek * 7 + minusDay;
        const minusDaysSleep = minusWeek * 7 + minusDay + 1;

        const targetDateUp = DateUtils.AddDays(currentWorkDate, - minusDaysUp);
        const targetDateSleep = DateUtils.AddDays(currentWorkDate, - minusDaysSleep);

        const history1 = this.calendarTaskService.getTaskHistoryNoVoid(task1, targetDateUp);
        const history2 = this.calendarTaskService.getTaskHistoryNoVoid(task2, targetDateSleep);

        const date1 = this.getPreviousDayResultDate(history1);

        const date2 = this.getPreviousDayResultDate(history2);

        // TODO : Filter Invalid Data
        // if (taskStats. date2.getHours() )

        // TODO : const EndOfDayCutOff

        if (date1 == null || date2 == null) {
          taskStats.results.push('n/a');
        } else {
          const diffTOtal = DateUtils.getHHmmFromTimeDifferences(date1, date2);

          taskStats.results.push(diffTOtal);
        }

        const previousDaySkipped = taskStats.results[taskStats.results.length - 1].includes('n/a');
        taskStats.skippedDays.push(previousDaySkipped);
        taskStats.doneDays.push(!previousDaySkipped);
      }
    }

    return taskStats;
  }

  public getSleepDurationStats(currentWorkDate: Date,
                               minusWeeks: number): TaskStats {
    return this.getCustomStats(currentWorkDate,
                               minusWeeks,
                               StatType.TimeUp,
                               StatType.TimeSleep,
                               this.translate.instant('task-stats.hours-of-sleep'));
  }

  public getTimeRestrictedDurationStats(currentWorkDate: Date,
                                        minusWeeks: number): TaskStats {
    return this.getCustomStats(currentWorkDate,
                              minusWeeks,
                              StatType.TimeNonWaterStart,
                              StatType.TimeNonWaterStop,
                              this.translate.instant('task-stats.time-restricted-duration'));
  }

  public getFastingDurationStats(currentWorkDate: Date,
                                 minusWeeks: number): TaskStats {
    return this.getCustomStats(currentWorkDate,
                              minusWeeks,
                              StatType.TimeEatStart,
                              StatType.TimeEatStop,
                              this.translate.instant('task-stats.fasting-duration'));
    }

  public getPreviousDayResult(currentTask: CalendarTask,
                              history: TaskHistory): string {
    // console.log('Origin GetPreviousDayResult');

    if (history != null && history.TaskResult != null) {
      if (currentTask.isTime()) {
        return this.datepipe.transform(history.TaskResult, 'HH:mm');
      } else {
        return String(history.TaskResult);
      }
    } else {
      return ' n/a ';
    }
  }

  public getPreviousDayResultDate(history: TaskHistory): Date {
    if (history != null && history.TaskResult != null) {
      // console.log('GETPreviousDayResultDate', history);
      return new Date(history.TaskResult);
    } else {
      return null;
    }
  }

  public getPreviousDayDuration(history: TaskHistory): string {
    return history.getDurationString();
  }

  private previousDaySkipped(history: TaskHistory): boolean {
    if (history == null) {
      return true;
    } else if (history.TaskResult == null && history.TaskDone !== true) { // TODO: Result should be true for binary
      return true;
    } else if (history.TaskSkipped) {
      return true;
    } else {
      return false;
    }
  }

  private previousDayDone(history: TaskHistory): boolean {
    return history.TaskDone === true;
  }

  public getMinusWeeksArray(weeksBehind: number,
                            startingMinDays: number): number[] {
    const minusWeeksArray: number[] = [];
    let startingWeek = Math.ceil(startingMinDays / 7);
    if (startingWeek === 0) {
      startingWeek = 1;
    }

    if (weeksBehind > startingWeek) {
      weeksBehind = startingWeek;
    }

    for (let i = 0; i < weeksBehind; i++) {
      minusWeeksArray.push(weeksBehind - i - 1);
    }

    // console.log('minusWeeksArray', minusWeeksArray, startingMinDays, weeksBehind, startingWeek);

    return minusWeeksArray;
  }
}

