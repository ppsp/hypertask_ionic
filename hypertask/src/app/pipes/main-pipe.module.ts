import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormatTimePipe } from './format-timer-pipe';
import { FormatDayOfWeekPipe } from './format-dayofweek-pipe';
import { FormatDayOfWeekAbbrPipe } from './format-dayofweek-abbr-pipe';

@NgModule({
  declarations: [ FormatTimePipe, FormatDayOfWeekPipe, FormatDayOfWeekAbbrPipe ],
  imports: [ CommonModule ],
  exports: [ FormatTimePipe, FormatDayOfWeekPipe, FormatDayOfWeekAbbrPipe ]
})

export class MainPipeModule {}
