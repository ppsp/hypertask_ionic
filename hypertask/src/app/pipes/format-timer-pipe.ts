import { PipeTransform, Pipe } from '@angular/core';

@Pipe({
  name: 'formatTimer'
})
export class FormatTimePipe implements PipeTransform {
  transform(value: number): string {
    const minutes: number = Math.floor(value / 60) % 60;
    const hours: number = Math.floor(value / 60 / 60);
    if (hours < 1) {
      return ('00' + minutes).slice(-2) + ':' + ('00' + Math.floor(value - minutes * 60)).slice(-2);
    } else {
      return ('00' + hours).slice(-2) + ':' + ('00' + minutes).slice(-2) + ':' + ('00' + Math.floor(value - minutes * 60)).slice(-2);
    }
  }
}
