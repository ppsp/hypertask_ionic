import { Component, OnInit, Input, ViewChildren, OnDestroy } from '@angular/core';
import { TaskGroup } from 'src/app/models/Core/task-group';
import { PopoverController, Platform, IonReorderGroup, ModalController } from '@ionic/angular';
import { GroupPopoverComponent } from '../group-popover/group-popover.component';
import { EventService, EventData } from 'src/app/services/event.service';
import { TaskCardComponent } from '../TaskCard/task-card/task-card.component';
import { CalendarTaskService } from 'src/app/services/calendar-task.service';
import { Subscription } from 'rxjs';
import { Ionic4DatepickerModalComponent } from '@logisticinfotech/ionic4-datepicker';
import DateUtils from 'src/app/shared/date-utils';
import { DateService } from 'src/app/services/date.service';
import { TaskFrequency } from 'src/app/models/Core/task-frequency.enum';

@Component({
  selector: 'app-group-card',
  templateUrl: './group-card.component.html',
  styleUrls: ['./group-card.component.scss'],
})
export class GroupCardComponent implements OnInit, OnDestroy {

  @Input() currentGroup: TaskGroup;

  @ViewChildren('taskcard') currentCards: any;
  @ViewChildren('reorderGroup') reorderGroup: IonReorderGroup;

  public disableDragAndDrop: boolean = true;
  private subscriptions: Subscription[] = [];
  private datePickerObj: any = {};

  constructor(private popoverController: PopoverController,
              private eventService: EventService,
              private platform: Platform,
              private taskService: CalendarTaskService,
              private dateService: DateService,
              private modalController: ModalController) { }

  async ngOnInit() {

    await this.platform.ready();

    // Show timers retrieved from persistance
    /*for (const card of this.currentCards as TaskCardComponent[]) {
      card.viewModel.showTimerIfExists();
    }*/

    this.subscriptions.push(this.eventService.on(EventService.EventIds.SkipAllGroup + this.currentGroup.GroupId, async () => {
      await this.skipAll();
      this.eventService.emit(new EventData(EventService.EventIds.ProgressBar, null));
    }));

    this.subscriptions.push(this.eventService.on(EventService.EventIds.PostponeAllGroup + this.currentGroup.GroupId, async () => {
      await this.postponeAll();
    }));

    this.subscriptions.push(this.eventService.on(EventService.EventIds.SkipAll, async () => {
      await this.skipAll();
    }));

    this.subscriptions.push(this.eventService.on(EventService.EventIds.ToggleDragAndDrop, async (enable: boolean) => {
      this.disableDragAndDrop = !enable;
    }));

    this.disableDragAndDrop = !this.taskService.enableDragAndDrop;
  }

  ngOnDestroy(): void {
    for (const sub of this.subscriptions) {
      sub.unsubscribe();
    }
  }

  async doReorder(ev: any) {
    // Before complete is called with the items they will remain in the
    // order before the drag
    // console.log('EVENT', ev);
    // console.log('FROM, TO', ev.detail.from, ev.detail.to);
    // console.log('Before complete', this.currentGroup.Tasks);

    const from = Number(ev.detail.from);
    const to = Number(ev.detail.to);

    if (from < 0) {
      return;
    }
    if (to > this.currentGroup.Tasks.length - 1) {
      ev.detail.complete();
      return;
    }
    const fromTask = this.currentGroup.Tasks[from];
    const toTask = this.currentGroup.Tasks[to];

    // console.log('FROM ABSOLUTE', fromTask.AbsolutePosition);
    // console.log('TO ABSOLUTE', toTask.AbsolutePosition);

    fromTask.AbsolutePosition = toTask.AbsolutePosition;

    await this.taskService.updateCalendarTask(fromTask);
    ev.detail.complete();

    // Finish the reorder and position the item in the DOM based on
    // where the gesture ended. Update the items variable to the
    // new order of items
    // this.currentGroup.Tasks = ev.detail.complete(this.currentGroup.Tasks);

    // After complete is called the items will be in the new order
    // console.log('After complete', this.currentGroup.Tasks);
  }

  private async skipAll() {
    for (const card of this.currentCards as TaskCardComponent[]) {
      if (card.viewModel.isShown === true &&
          card.viewModel.showMainTaskButtons === true &&
          card.viewModel.showBtnSkip === true) {
        // console.log('SKIPPING', card.currentTask.Name);
        // console.log('skipping', card.viewModel.currentTask.Name);
        await card.skip();
        card.viewModel.reset();
      }
    }

    // console.log('EMITTING PROGRESSBAR');
    this.eventService.emit(new EventData(EventService.EventIds.ProgressBar, null));
  }

  private async postponeAll() {
    const datePickerModal = await this.modalController.create({
      component: Ionic4DatepickerModalComponent,
      cssClass: 'li-ionic4-datePicker',
      componentProps: {
         objConfig: this.datePickerObj,
         selectedDate: DateUtils.AddDays(this.dateService.currentWorkDate, 1)
      }
    });
    await datePickerModal.present();

    const subscription = this.platform.backButton.subscribe(async () => {
      await datePickerModal.dismiss();
    });

    const data = await datePickerModal.onDidDismiss();

    subscription.unsubscribe();

    const selectedDate = new Date(data.data.date);

    if (!DateUtils.isValidDate(selectedDate)) { // standard cancel
      return;
    }

    for (const card of this.currentCards as TaskCardComponent[]) {
      if (card.viewModel.isShown === true &&
          card.viewModel.showMainTaskButtons === true &&
          card.viewModel.showBtnSkip === true &&
          (card.currentTask.Frequency === TaskFrequency.UntilDone ||
           card.currentTask.Frequency === TaskFrequency.Once)) {
        // console.log('SKIPPING', card.currentTask.Name);
        // console.log('postponing ', card.viewModel.currentTask.Name);
        await card.postponeTask(selectedDate);
        card.viewModel.reset();
      }
    }

    // console.log('EMITTING PROGRESSBAR');
    this.eventService.emit(new EventData(EventService.EventIds.ProgressBar, null));
  }

  public toggleGroup() {
    this.currentGroup.isExpanded = !this.currentGroup.isExpanded;
  }

  public async groupMenuClick(event: any) {
    event.stopPropagation();
    const popover = await this.popoverController.create({
      component: GroupPopoverComponent,
      cssClass: 'group-popover',
      componentProps: {
        group: this.currentGroup,
      },
      event,
      translucent: false,
      animated: false,
      showBackdrop: false,
    });
    return await popover.present();
  }
}
