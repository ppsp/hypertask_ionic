import { PipeTransform, Pipe } from '@angular/core';
import { DayOfWeek } from '../models/Core/day-of-week.enum';

@Pipe({
  name: 'formatDayOfWeekPipe'
})
export class FormatDayOfWeekPipe implements PipeTransform {
  transform(day: DayOfWeek): string {
    switch (day) {
        case DayOfWeek.Monday: {
          return 'Monday';
        }
        case DayOfWeek.Tuesday: {
          return 'Tuesday';
        }
        case DayOfWeek.Wednesday: {
          return 'Wednesday';
        }
        case DayOfWeek.Thursday: {
          return 'Thursday';
        }
        case DayOfWeek.Friday: {
          return 'Friday';
        }
        case DayOfWeek.Saturday: {
          return 'Saturday';
        }
        case DayOfWeek.Sunday: {
          return 'Sunday';
        }
    }
  }
}
