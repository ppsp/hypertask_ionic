import { DayOfWeek } from './day-of-week.enum';
import { TaskFrequency } from './task-frequency.enum';
import { ResultType } from './result-type.enum';
import { StatType } from './custom-stat.enum';

export class SelectableTask {
  Name: string;
  Description: string;
  RequiredDays: DayOfWeek[] = [];
  Frequency: TaskFrequency = TaskFrequency.Daily;
  AbsolutePosition: number;
  ResultType: ResultType = ResultType.Binary;
  AdditionnalTask: AdditionnalTask;
  GroupName: string;

  constructor(name: string,
              description: string,
              frequency: TaskFrequency,
              resultType: ResultType,
              groupName: string) {
    this.Name = name;
    this.Description = description;
    this.Frequency = frequency;
    this.ResultType = resultType;
    this.RequiredDays.push(DayOfWeek.Monday);
    this.RequiredDays.push(DayOfWeek.Tuesday);
    this.RequiredDays.push(DayOfWeek.Wednesday);
    this.RequiredDays.push(DayOfWeek.Thursday);
    this.RequiredDays.push(DayOfWeek.Friday);
    this.RequiredDays.push(DayOfWeek.Saturday);
    this.RequiredDays.push(DayOfWeek.Sunday);
    this.GroupName = groupName;
  }
}

export class AdditionnalTask {
  Task1Name: string;
  Task2Name: string;
  StatName: string;
  AbsolutePositionTask2: number;
  StatType1: StatType;
  StatType2: StatType;
  GroupName: string;
}
