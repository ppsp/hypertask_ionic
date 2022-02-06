import { Injectable } from '@angular/core';
import { SelectableTask, AdditionnalTask } from '../models/Core/selectable-task';
import { TaskFrequency } from '../models/Core/task-frequency.enum';
import { ResultType } from '../models/Core/result-type.enum';
import { StatType } from '../models/Core/custom-stat.enum';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class SelectableTaskService {

  public static MorningRoutinesGroupName: string = 'MorningRoutines';
  public static EveningRoutinesGroupName: string = 'EveningRoutines';
  public static RegularRoutinesGroupName: string = 'RegularRoutines';

  constructor(private translate: TranslateService) { }

  public getAllSelectableTasks(): SelectableTask[] {
    const tasks: SelectableTask[] = [];

    let positionIterator = 1;

    const task1 = new SelectableTask(this.translate.instant('selectable-tasks.sleep-title'),
                                     this.translate.instant('selectable-tasks.sleep-description'),
                                      TaskFrequency.Daily,
                                      ResultType.TimeOfDay,
                                      SelectableTaskService.MorningRoutinesGroupName);
    let additionnalTask = new AdditionnalTask();
    additionnalTask.Task1Name = this.translate.instant('selectable-tasks.time-wake-up');
    additionnalTask.Task2Name = this.translate.instant('selectable-tasks.time-sleep');
    additionnalTask.StatName = this.translate.instant('selectable-tasks.sleeping-duration');
    task1.AbsolutePosition = positionIterator++;
    additionnalTask.GroupName = SelectableTaskService.EveningRoutinesGroupName;
    additionnalTask.AbsolutePositionTask2 = 398;
    additionnalTask.StatType1 = StatType.TimeUp;
    additionnalTask.StatType2 = StatType.TimeSleep;
    task1.AdditionnalTask = additionnalTask;
    tasks.push(task1);

    /*
    const task12 = new SelectableTask(this.translate.instant('selectable-tasks.time-restricted-title'),
                                      this.translate.instant('selectable-tasks.time-restricted-description'),
                                      TaskFrequency.Daily,
                                      ResultType.TimeOfDay);
    additionnalTask = new AdditionnalTask();
    additionnalTask.Task1Name = this.translate.instant('selectable-tasks.first-non-water');
    additionnalTask.Task2Name = this.translate.instant('selectable-tasks.last-non-water');
    additionnalTask.StatName = this.translate.instant('selectable-tasks.time-restricted-duraton');
    additionnalTask.StatType1 = StatType.TimeNonWaterStart;
    additionnalTask.StatType2 = StatType.TimeNonWaterStop;
    task12.AbsolutePosition = 2;
    additionnalTask.AbsolutePositionTask2 = 397;
    task12.AdditionnalTask = additionnalTask;
    tasks.push(task12);*/

    const task11 = new SelectableTask(this.translate.instant('selectable-tasks.fasting-title'),
                                      this.translate.instant('selectable-tasks.fasting-description'),
                                      TaskFrequency.Daily,
                                      ResultType.TimeOfDay,
                                      SelectableTaskService.MorningRoutinesGroupName);
    additionnalTask = new AdditionnalTask();
    additionnalTask.Task1Name = this.translate.instant('selectable-tasks.first-eating');
    additionnalTask.Task2Name = this.translate.instant('selectable-tasks.last-eating');
    additionnalTask.StatName = this.translate.instant('selectable-tasks.fast-duration');
    additionnalTask.StatType1 = StatType.TimeEatStart;
    additionnalTask.StatType2 = StatType.TimeEatStop;
    additionnalTask.GroupName = SelectableTaskService.EveningRoutinesGroupName;
    task11.AbsolutePosition = positionIterator++;
    additionnalTask.AbsolutePositionTask2 = 300;
    task11.AdditionnalTask = additionnalTask;
    tasks.push(task11);

    const task17 = new SelectableTask(this.translate.instant('selectable-tasks.bed-title'),
                                      null,
                                      TaskFrequency.Daily,
                                      ResultType.Binary,
                                      SelectableTaskService.MorningRoutinesGroupName);
    task17.AbsolutePosition = positionIterator++;
    tasks.push(task17);

    const task2 = new SelectableTask(this.translate.instant('selectable-tasks.weight-title'),
                                     null,
                                     TaskFrequency.Daily,
                                     ResultType.Decimal,
                                     SelectableTaskService.MorningRoutinesGroupName);
    task2.AbsolutePosition = positionIterator++;
    tasks.push(task2);

    const task5 = new SelectableTask(this.translate.instant('selectable-tasks.reading-title'),
                                     null,
                                     TaskFrequency.Daily,
                                     ResultType.Duration,
                                     SelectableTaskService.RegularRoutinesGroupName);
    task5.AbsolutePosition = positionIterator++;
    tasks.push(task5);

    const task20 = new SelectableTask(this.translate.instant('selectable-tasks.audio-title'),
                                      null,
                                      TaskFrequency.Daily,
                                      ResultType.Duration,
                                      SelectableTaskService.RegularRoutinesGroupName);
    task20.AbsolutePosition = positionIterator++;
    tasks.push(task20);

    const task4 = new SelectableTask(this.translate.instant('selectable-tasks.meditation-title'),
                                     null,
                                     TaskFrequency.Daily,
                                     ResultType.Binary,
                                     SelectableTaskService.RegularRoutinesGroupName);
    task4.AbsolutePosition = positionIterator++;
    tasks.push(task4);

    const task3 = new SelectableTask(this.translate.instant('selectable-tasks.exercise-title'),
                                     null,
                                     TaskFrequency.Daily,
                                     ResultType.Duration,
                                     SelectableTaskService.RegularRoutinesGroupName);
    task3.AbsolutePosition = positionIterator++;
    tasks.push(task3);

    const task19 = new SelectableTask(this.translate.instant('selectable-tasks.stretch-title'),
                                      null,
                                      TaskFrequency.Daily,
                                      ResultType.Binary,
                                      SelectableTaskService.RegularRoutinesGroupName);
    task19.AbsolutePosition = positionIterator++;
    tasks.push(task19);

    const task6 = new SelectableTask(this.translate.instant('selectable-tasks.mail-title'),
                                     null,
                                     TaskFrequency.Daily,
                                     ResultType.Binary,
                                     SelectableTaskService.RegularRoutinesGroupName);
    task6.AbsolutePosition = positionIterator++;
    tasks.push(task6);

    const task7 = new SelectableTask(this.translate.instant('selectable-tasks.emails-title'),
                                     null,
                                     TaskFrequency.Daily,
                                     ResultType.Binary,
                                     SelectableTaskService.RegularRoutinesGroupName);
    task7.AbsolutePosition = positionIterator++;
    tasks.push(task7);

    const task9 = new SelectableTask(this.translate.instant('selectable-tasks.clean-title'),
                                     null,
                                     TaskFrequency.Daily,
                                     ResultType.Binary,
                                     SelectableTaskService.RegularRoutinesGroupName);
    task9.AbsolutePosition = positionIterator++;
    tasks.push(task9);

    const task10 = new SelectableTask(this.translate.instant('selectable-tasks.dishes-title'),
                                      null,
                                      TaskFrequency.Daily,
                                      ResultType.Binary,
                                      SelectableTaskService.RegularRoutinesGroupName);
    task10.AbsolutePosition = positionIterator++;
    tasks.push(task10);

    const task16 = new SelectableTask(this.translate.instant('selectable-tasks.walk-title'),
                                      null,
                                      TaskFrequency.Daily,
                                      ResultType.Binary,
                                      SelectableTaskService.RegularRoutinesGroupName);
    task16.AbsolutePosition = positionIterator++;
    tasks.push(task16);

    /*const task18 = new SelectableTask(this.translate.instant('selectable-tasks.floss-title'),
                                      null,
                                      TaskFrequency.Daily,
                                      ResultType.Binary);
    task18.AbsolutePosition = positionIterator++;
    tasks.push(task18);*/

/*
    const task15 = new SelectableTask(this.translate.instant('selectable-tasks.rating-title'),
                                      this.translate.instant('selectable-tasks.rating-description'),
                                      TaskFrequency.Daily,
                                      ResultType.Decimal);
    task15.AbsolutePosition = 12;
    tasks.push(task15);*/

    return tasks;
  }
}
