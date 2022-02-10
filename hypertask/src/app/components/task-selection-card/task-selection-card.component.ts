import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SelectableTask } from 'src/app/models/Core/selectable-task';
import { DayOfWeek } from 'src/app/models/Core/day-of-week.enum';

@Component({
  selector: 'app-task-selection-card',
  templateUrl: './task-selection-card.component.html',
  styleUrls: ['./task-selection-card.component.scss'],
})
export class TaskSelectionCardComponent implements OnInit {

  @Input() currentTask: SelectableTask;

  public daysOfWeek: DayOfWeek[] = [ DayOfWeek.Monday,
    DayOfWeek.Tuesday,
    DayOfWeek.Wednesday,
    DayOfWeek.Thursday,
    DayOfWeek.Friday,
    DayOfWeek.Saturday,
    DayOfWeek.Sunday
  ];

  public taskSelected: boolean = false;
  public showDescription: boolean = false;

  @Output() checkChangedEvent: EventEmitter<any[]> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
    this.showDescription = this.currentTask.Description != null &&
                           this.currentTask.Description.length > 0;
  }

  public cardClick() {
    this.taskSelected = !this.taskSelected;
    this.checkChangedEvent.emit([this.taskSelected as any,
                                 this.currentTask as any]);
  }

  public checkChanged() {
    event.stopPropagation();
  }

  public cbDayOfWeek(event: any, dayOfWeek: number): void {
    if (event.detail.checked) {
      this.currentTask.RequiredDays.push(dayOfWeek);
    } else {
      this.currentTask.RequiredDays = this.currentTask.RequiredDays.filter(p => p.valueOf() !== dayOfWeek);
    }
  }
}
