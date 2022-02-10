import { Component, OnInit, Input } from '@angular/core';
import { CalendarTask } from 'src/app/models/Core/calendar-task';
import { PopoverController, ModalController, AlertController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { TaskEditComponent } from '../../task-edit/task-edit.component';
import { Ionic4DatepickerModalComponent } from '@logisticinfotech/ionic4-datepicker';
import { DateService } from 'src/app/services/date.service';
import DateUtils from 'src/app/shared/date-utils';
import { CalendarTaskService } from 'src/app/services/calendar-task.service';
import { ILogger } from 'src/app/interfaces/i-logger';
import { AlertOptions } from '@ionic/core';
import { TaskCardViewModel } from '../task-card/task-card-viewmodel';
import { AlertService } from 'src/app/services/alert.service';
import { TaskHistory } from 'src/app/models/Core/task-history';
import { TaskHistoryService } from 'src/app/services/task-history.service';
import { EventService, EventData } from 'src/app/services/event.service';
import { VibrationService } from 'src/app/services/vibration.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-task-card-popover',
  templateUrl: './task-card-popover.component.html',
  styleUrls: ['./task-card-popover.component.scss'],
})
export class TaskCardPopoverComponent implements OnInit {

  @Input() currentTask: CalendarTask;
  @Input() viewModel: TaskCardViewModel;

  public btnShowStatsShown: boolean = true;
  public btnAddNoteShown: boolean = true;
  public btnVoidResultShown: boolean = true;
  public btnResumeTimerShown: boolean = true;

  private datePickerObj: any = {};

  constructor(private popoverController: PopoverController,
              private modalController: ModalController,
              private dateService: DateService,
              private calendarTaskService: CalendarTaskService,
              private logger: ILogger,
              private translate: TranslateService,
              private alertController: AlertController,
              private alertService: AlertService,
              private taskHistoryService: TaskHistoryService,
              private eventService: EventService,
              private vibrationService: VibrationService,
              private modalService: ModalService,
              private platform: Platform) { }

  ngOnInit() {}

  public async btnEditTaskClick() {
    await this.modalService.showEditTaskModal(TaskEditComponent, this.currentTask);
    await this.popoverController.dismiss();
  }

  // TODO : Extract this from here, it's duplicate
  public async btnPostponeClick() {
    const datePickerModal = await this.modalController.create({
      component: Ionic4DatepickerModalComponent,
      cssClass: 'li-ionic4-datePicker',
      componentProps: {
         objConfig: this.datePickerObj,
         selectedDate: DateUtils.AddDays(this.dateService.currentWorkDate, 1)
      }
    });
    await datePickerModal.present();

    const data = await datePickerModal.onDidDismiss();

    const selectedDate = new Date(data.data.date);

    if (!DateUtils.isValidDate(selectedDate)) { // standard cancel
      await this.popoverController.dismiss();
      return;
    }

    this.currentTask.SkipUntil = selectedDate;

    const result = await this.calendarTaskService.updateCalendarTask(this.currentTask);
    if (result) {
      this.viewModel.reset();
      this.eventService.emit(new EventData(EventService.EventIds.ProgressBar, null));
    } else {
      this.logger.logError(new Error('Unable to save skip until'));
      alert(this.translate.instant('btnPostponeClick-card.error-saving-skip-until'));
    }
    await this.popoverController.dismiss();
  }

  public async btnShowStatsClick() {
    this.eventService.emit(new EventData(EventService.EventIds.ShowStats + this.currentTask.CalendarTaskId, true));
    await this.popoverController.dismiss();
  }

  public async btnAddNoteClick() {
    const handler: (alertData: any) => void = (alertData) => {
      this.saveNote(alertData).then(() => {
        this.viewModel.showNote = true;
        this.viewModel.currentNote = this.viewModel.getTaskNote();
      });
    };

    const alertOptions: AlertOptions = this.alertService.getNoteAlertOptions(handler);
    const alert = await this.alertController.create(alertOptions);
    await alert.present();

    const firstInput: any = document.querySelector('ion-alert input');
    await this.popoverController.dismiss();
    firstInput.focus();

    const subscription = this.platform.backButton.subscribe(async () => {
      await alert.dismiss();
    });
    await alert.onDidDismiss();
    subscription.unsubscribe();
  }

  private async saveNote(alertData: any) {
    // Disable data over 1000 characters
    if (alertData.Value.length > 2000) {
      alertData.Value = alertData.Value.substring(0, 2000);
    }

    const history: TaskHistory = this.calendarTaskService.getTaskHistoryNoVoid(this.viewModel.currentTask,
                                                                               this.dateService.currentWorkDate);
    // console.log('saveNote', history);
    history.Comment = alertData.Value;
    await this.taskHistoryService.updateTaskHistory(history);
    this.eventService.emit(new EventData(EventService.EventIds.CardReset + this.currentTask.CalendarTaskId, true));
  }

  public async btnVoidResultClick() {
    const handler: (alertData: any) => void = (alertData) => {
      this.voidResult();
    };

    const alertOptions: AlertOptions = this.alertService.getVoidAlertOptions(handler);
    const alert = await this.alertController.create(alertOptions);
    await alert.present();
    await this.popoverController.dismiss();

    const subscription = this.platform.backButton.subscribe(async () => {
      await alert.dismiss();
    });
    await alert.onDidDismiss();
    subscription.unsubscribe();
  }

  private async voidResult(): Promise<void> {
    // this.isSelected = false;
    const calendarTaskHistory = this.calendarTaskService.getTaskHistoryNoVoid(this.viewModel.currentTask,
                                                                              this.dateService.currentWorkDate);
    calendarTaskHistory.Void = true;
    const success = await this.taskHistoryService.updateTaskHistory(calendarTaskHistory);
    if (success) { // TODO: Test error
      if (success === true) {
        this.viewModel.voidResult();
      } else {
        this.logger.logError(new Error('Unable to void TaskHistory, result is false'));
        alert(this.translate.instant('task-card.msg-saving-error'));
      }
    } else {
    this.logger.logError(new Error('Unable to void TaskHistory : '));
    }
    return;
  }

  public async btnResumeTimerClick() {
    this.vibrationService.vibrate(5);
    this.eventService.emit(new EventData(EventService.EventIds.TimerResume + this.currentTask.CalendarTaskId, true));
    await this.popoverController.dismiss();
  }
}
