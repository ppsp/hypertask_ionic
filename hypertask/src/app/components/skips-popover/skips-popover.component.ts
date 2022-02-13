import { Component, OnInit, Input } from '@angular/core';
import { CalendarTask } from 'src/app/models/Core/calendar-task';
import { TaskCardViewModel } from '../TaskCard/task-card/task-card-viewmodel';
import { PopoverController } from '@ionic/angular';
import { EventData, EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-skips-popover',
  templateUrl: './skips-popover.component.html',
  styleUrls: ['./skips-popover.component.scss'],
})
export class SkipsPopoverComponent implements OnInit {

  @Input() currentTask: CalendarTask;
  @Input() viewModel: TaskCardViewModel;
  @Input() daysInARow: number;

  constructor(private popoverController: PopoverController,
              private eventService: EventService) { }

  ngOnInit() {}

  public btnCancelClick() {
    this.popoverController.dismiss();
  }

  public btnYesClick() {
    this.eventService.emit(new EventData(EventService.EventIds.SkipTask + this.currentTask.CalendarTaskId, null));
    this.popoverController.dismiss();
  }

  public btnPostponeClick() {
    this.eventService.emit(new EventData(EventService.EventIds.PostponeTask + this.currentTask.CalendarTaskId, null));
    this.popoverController.dismiss();
  }

  public btnEnableNotificationsClick() {
    this.popoverController.dismiss();
  }

  public btnDeleteClick() {
    // confirmation
    this.eventService.emit(new EventData(EventService.EventIds.DeleteTask + this.currentTask.CalendarTaskId, null));
    this.popoverController.dismiss();
  }
}
