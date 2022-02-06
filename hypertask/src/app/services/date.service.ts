import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import DateUtils from '../shared/date-utils';
import { UserConfig } from '../models/Core/user-config';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class DateService {

  private cachedWorkDates: Map<string, Date> = new Map<string, Date>();
  private cachedEndOfDayTime: string;
  public cachingEnabled: boolean = false;

  public currentWorkDate: Date = new Date();

  private weekdays = [
    'create-task.sunday-abbreviation',
    'create-task.monday-abbreviation',
    'create-task.tuesday-abbreviation',
    'create-task.wednesday-abbreviation',
    'create-task.thursday-abbreviation',
    'create-task.friday-abbreviation',
    'create-task.saturday-abbreviation'
  ];

  private monthAbbrs = [
    'task-list.january-abbreviation',
    'task-list.february-abbreviation',
    'task-list.march-abbreviation',
    'task-list.april-abbreviation',
    'task-list.may-abbreviation',
    'task-list.june-abbreviation',
    'task-list.july-abbreviation',
    'task-list.august-abbreviation',
    'task-list.september-abbreviation',
    'task-list.october-abbreviation',
    'task-list.november-abbreviation',
    'task-list.december-abbreviation',
  ];

  private weekAbbrs = [
    'task-list.sunday-abbreviation',
    'task-list.monday-abbreviation',
    'task-list.tuesday-abbreviation',
    'task-list.wednesday-abbreviation',
    'task-list.thursday-abbreviation',
    'task-list.friday-abbreviation',
    'task-list.saturday-abbreviation'
  ];

  constructor(private userService: UserService,
              private translate: TranslateService) { }

  public GetMonthAbbrs(): string[] {
    return [
      this.translate.instant(this.monthAbbrs[0]),
      this.translate.instant(this.monthAbbrs[1]),
      this.translate.instant(this.monthAbbrs[2]),
      this.translate.instant(this.monthAbbrs[3]),
      this.translate.instant(this.monthAbbrs[4]),
      this.translate.instant(this.monthAbbrs[5]),
      this.translate.instant(this.monthAbbrs[6]),
      this.translate.instant(this.monthAbbrs[7]),
      this.translate.instant(this.monthAbbrs[8]),
      this.translate.instant(this.monthAbbrs[9]),
      this.translate.instant(this.monthAbbrs[10]),
      this.translate.instant(this.monthAbbrs[11]),
    ];
  }

  public GetWeekAbbrs(): string[] {
    return [
      this.translate.instant(this.weekAbbrs[0]),
      this.translate.instant(this.weekAbbrs[1]),
      this.translate.instant(this.weekAbbrs[2]),
      this.translate.instant(this.weekAbbrs[3]),
      this.translate.instant(this.weekAbbrs[4]),
      this.translate.instant(this.weekAbbrs[5]),
      this.translate.instant(this.weekAbbrs[6]),
    ];
  }

  public GetWorkDate(date: Date): Date {
    /*console.log('GetWorkDate Fastest Possible');
    return DateUtils.RemoveHours(new Date());*/

    let dateSubString: string;
    if (this.cachingEnabled === true) {
      dateSubString = date.toISOString().substring(0, 13);

      const cachedDate = this.cachedWorkDates.get(dateSubString);
      if (cachedDate != null) {
        // console.log('GetWorkDate from Cache');
        return cachedDate;
      }
    }

    const result = DateUtils.GetWorkDate(date, this.cachedEndOfDayTime == null ?
                                                 this.cachedEndOfDayTime :
                                                 this.userService.getConfig(UserConfig.EndOfDayTimeKey));

    if (this.cachingEnabled === true) {
      this.cachedWorkDates.set(dateSubString, result);
    }

    // console.log('GetWorkDate Regular');

    return result;

    /*console.log('GetWorkDate Regular');
    return DateUtils.GetWorkDate(date, this.userService.getUserConfig().EndOfDayTime);*/
  }

  public ResetCaching(): void {
    this.cachedEndOfDayTime = this.userService.getConfig(UserConfig.EndOfDayTimeKey);
    this.cachedWorkDates.clear();
  }

  public GetTodayWorkDate(): Date {
    return DateUtils.GetWorkDate(new Date(), this.cachedEndOfDayTime == null ?
                                               this.cachedEndOfDayTime :
                                               this.userService.getConfig(UserConfig.EndOfDayTimeKey));
  }

  public GetmmddFromMinusDays(minusDays: number, todayWorkDate: Date): string {
    // console.log('getmmdd', minusDays, todayWorkDate, new Date().toISOString().substring(10));

    const date = DateUtils.AddDays(todayWorkDate,
                                   -1 * minusDays);

    const ddmm = date.toISOString().slice(5, 10);

    // const dayAbbr = this.translate.instant(this.weekdays[date.getDay()]);

    // const result = dayAbbr + ' ' + ddmm;

    return ddmm;
  }
}
