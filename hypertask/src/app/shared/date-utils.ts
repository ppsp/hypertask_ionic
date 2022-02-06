


export default class DateUtils {
  public static SecondsInMinute: number = 60;
  public static SecondsInHour: number = 60 * 60;

  private static cachedWorkDated: {};

  public static datesAreEqual(d1: Date, d2: Date): boolean {
    if (d1 == null && d2 == null) {
      return true;
    }

    if (d1 == null || d2 == null) {
      return false;
    }

    // console.log('datesAreEqual'); /*, d1, d2);*/
    return d1.setHours(0, 0, 0, 0) === d2.setHours(0, 0, 0, 0);
  }

  public static dateTimeAreEqual(d1: Date, d2: Date): boolean {
    if (d1 == null && d2 == null) {
      return true;
    }

    if (d1 == null || d2 == null) {
      return false;
    }

    // console.log('datesAreEqual'); /*, d1, d2);*/
    return d1.getTime() === d2.getTime();
  }

  public static Today(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  // Taken from : https://stackoverflow.com/questions/563406/add-days-to-javascript-date
  // Credits to sparebytes for the correct answer
  public static AddDays(date: Date, addDays: number): Date {
    const resultDate = new Date(date);
    resultDate.setDate(date.getDate() + addDays);
    resultDate.setHours(0, 0, 0, 0);
    return resultDate;
  }

  public static Tomorrow(): Date {
    return this.AddDays(this.Today(), 1);
  }

  public static MonthAgo(): Date {
    return this.AddDays(this.Today(), -31);
  }

  public static YearAgo(): Date {
    return this.AddDays(this.Today(), -365);
  }

  public static RemoveHours(date: Date) {
    const resultDate = new Date(date);
    resultDate.setHours(0, 0, 0, 0);
    return resultDate;
  }

  public static GetWorkDate(date: Date,
                            endOfDay: string = '04:00') {
    let resultDate = new Date(date);

    const endOfDayHours = Number(endOfDay.substring(0, 2));
    const endOfDayMinutes = Number(endOfDay.substring(3, 5));

    // console.log('IIIIIIII    GETWORKDATE     IIIIIII');
    // console.log('DATE', date);
    // console.log('endOfDay', endOfDay);
    // console.log('hours = ', date.getHours(), endOfDayHours);
    // console.log('minutes = ', date.getMinutes(), endOfDayMinutes);
    if (endOfDayHours < 12) {
      if (date.getHours() * 60 + date.getMinutes() < endOfDayHours * 60 + endOfDayMinutes) {
        // console.log('Workdate after midnight', endOfDay, endOfDayHours, endOfDayMinutes);
        resultDate = this.AddDays(new Date(date), -1);
      }
    } else {
      if (date.getHours() * 60 + date.getMinutes() > endOfDayHours * 60 + endOfDayMinutes) {
        // console.log('Workdate before midnight', endOfDay, endOfDayHours, endOfDayMinutes);
        resultDate = this.AddDays(new Date(date), 1);
      }
    }

    return this.RemoveHours(resultDate);
  }

  public static getLocalMysqlTimeFloored(date: Date) {
    const time = this.getLocalMysqlTimeString(date);
    let minuteIterator = Number(time.substring(3, 3 + 2));
    for (let i = 0; i < 60; i++) {
      minuteIterator --;
      if (minuteIterator % 5 === 0) {
        break;
      }
    }

    const minutes = minuteIterator.toString();

    if (minutes.length === 2) {
      return time.substring(0, 3) + minutes;
    } else {
      return time.substring(0, 3) + '0' + minutes;
    }
  }

  public static getLocalMysqlDateString(date: any) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) {
      month = '0' + month;
    }
    if (day.length < 2) {
      day = '0' + day;
    }

    return [year, month, day].join('-');
  }

  public static getLocalMysqlTimeString(date: any) {
    const d = new Date(date);
    let hours = '' + (d.getHours());
    let minutes = '' + d.getMinutes();
    let seconds = String(Math.floor(d.getSeconds()));

    if (hours.length < 2) {
      hours = '0' + hours;
    }
    if (minutes.length < 2) {
      minutes = '0' + minutes;
    }
    if (seconds.length < 2) {
      seconds = '0' + seconds;
    }

    return [hours, minutes, seconds].join(':');
  }

  public static getHHmmTimeUTC(date: Date) {
    return date.toISOString().substring(11, 16);
  }

  public static getAbsmsTimeDifference(date1: Date, date2: Date) {
    return Math.abs(date1.getTime() - date2.getTime());
  }

  public static getHHmmFrommsTime(ms: number) {
    const dateUtc = new Date(new Date(ms).toUTCString());
    return DateUtils.getHHmmTimeUTC(dateUtc);
  }

  public static getHHmmFromTimeDifferences(date1: Date, date2: Date) {
    const diff = DateUtils.getAbsmsTimeDifference(date1, date2);
    return DateUtils.getHHmmFrommsTime(diff);
  }

  public static getHoursFromSeconds(seconds: number) {
    return Math.floor(seconds / DateUtils.SecondsInHour);
  }

  public static getMinutesFromSeconds(seconds: number) {
    return Math.floor((seconds - DateUtils.getHoursFromSeconds(seconds) * DateUtils.SecondsInHour) / DateUtils.SecondsInMinute);
  }

  public static getSecondsFromSeconds(seconds: number) {
    return seconds - DateUtils.getMinutesFromSeconds(seconds) - DateUtils.getHoursFromSeconds(seconds);
  }

  public static daysBetween(startDate, endDate) {
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    return (DateUtils.treatAsUTC(endDate).getTime() - DateUtils.treatAsUTC(startDate).getTime()) / millisecondsPerDay;
  }

  public static treatAsUTC(date): Date {
    const result = new Date(date);
    result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
    return result;
  }

  public static getFlooredDate(date: Date): Date {
    const coeff = 1000 * 60 * 5;
    const rounded = new Date(Math.floor(date.getTime() / coeff) * coeff);
    return rounded;
  }

  public static getTimeSince(date: Date): string {
    const timediff = Date.now() - date.getTime();
    return timediff.toString();
  }

  public static getMillisecondsSince(date: Date): number {
    const timediff = Date.now() - date.getTime();
    return timediff;
  }

  public static isValidDate(d: Date): boolean {
    return d instanceof Date && !isNaN(d.valueOf());
  }

  public static getDurationString(totalSeconds: number): string {
    const hours = DateUtils.getHoursFromSeconds(totalSeconds);
    const minutes = DateUtils.getMinutesFromSeconds(totalSeconds);
    const seconds = Math.round(totalSeconds - DateUtils.SecondsInMinute * minutes - hours * DateUtils.SecondsInHour);
    const secondsString = seconds >= 10 ? String(seconds) : '0' + seconds;
    const minutesString = minutes >= 10 ? String(minutes) : '0' + minutes;

    // console.log('hours, minutes, seconds, secondsstring, minutestring', hours, minutes, seconds, minutesString, secondsString);

    if (hours === 0 && minutes < 1) {
      return '00:' + secondsString;
    } else if (hours === 0) {
      return minutes + ':' + secondsString;
    } else {
      return hours + ':' + minutesString + ':' + secondsString;
    }
  }
}
