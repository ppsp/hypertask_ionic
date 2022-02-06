import { ResultType } from './result-type.enum';
import { StatType } from './custom-stat.enum';

export class TaskStats {
  results: string[] = [];
  doneDays: boolean[] = [];
  skippedDays: boolean[] = [];
  resultType: ResultType;
  Name: string;
  StartingMinusDays: number;
  MinusWeeksArray: number[] = [];
  TaskInsertWorkDate: Date;
  StatType: StatType;
}

export class TaskStatRequest {
  name: string;
  calendarTaskId1: string;
  calendarTaskId2: string;
  statOperation: StatOperation;
  dateStart: Date;
  dateEnd: Date;
}

export enum StatOperation {
  addition = 0,
}
