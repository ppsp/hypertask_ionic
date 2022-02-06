import { PipeTransform, Pipe } from '@angular/core';
import { DayOfWeek } from '../models/Core/day-of-week.enum';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'formatDayOfWeekAbbrPipe'
})
export class FormatDayOfWeekAbbrPipe implements PipeTransform {

  constructor(private translate: TranslateService) {

  }

  transform(day: DayOfWeek): string {
    switch (day) {
        case DayOfWeek.Monday: {
          return this.translate.instant('create-task.monday-abbreviation');
        }
        case DayOfWeek.Tuesday: {
          return this.translate.instant('create-task.tuesday-abbreviation');
        }
        case DayOfWeek.Wednesday: {
          return this.translate.instant('create-task.wednesday-abbreviation');
        }
        case DayOfWeek.Thursday: {
          return this.translate.instant('create-task.thursday-abbreviation');
        }
        case DayOfWeek.Friday: {
          return this.translate.instant('create-task.friday-abbreviation');
        }
        case DayOfWeek.Saturday: {
          return this.translate.instant('create-task.saturday-abbreviation');
        }
        case DayOfWeek.Sunday: {
          return this.translate.instant('create-task.sunday-abbreviation');
        }
    }
  }
}
