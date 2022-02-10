import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Platform, ModalController, LoadingController, AlertController } from '@ionic/angular';
import { CalendarTaskService } from 'src/app/services/calendar-task.service';
import DateUtils from 'src/app/shared/date-utils';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from 'src/app/services/alert.service';
import { AlertOptions } from '@ionic/core';
import { TaskHistoryService } from 'src/app/services/task-history.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-note-list',
  templateUrl: './note-list.component.html',
  styleUrls: ['./note-list.component.scss'],
})
export class NoteListComponent implements OnInit, OnDestroy {

  private backButtonSubscription: Subscription;
  public taskFilters: TaskFilterViewModel[] = [];
  public allNotes: NoteViewModel[] = [];
  public filteredNotes: NoteViewModel[] = [];
  public startDateText: string;
  public endDateText: string;
  public startDate: Date;
  public endDate: Date;
  public keywordSearch: string = '';

  constructor(private platform: Platform,
              private modalController: ModalController,
              private calendarTaskService: CalendarTaskService,
              private translate: TranslateService,
              private loadingController: LoadingController,
              private alertCtrl: AlertController,
              private alertService: AlertService,
              private historyService: TaskHistoryService) { }

  ngOnInit() {
    this.resetBackButton();

    this.startDate = DateUtils.AddDays(DateUtils.Today(), -365);
    this.endDate = DateUtils.Today();
    this.startDateText = DateUtils.getLocalMysqlDateString(this.startDate);
    this.endDateText = DateUtils.getLocalMysqlDateString(this.endDate);
    this.initializeFilters();
    this.initializeAllNotes();
    this.setFilteredNotes();
  }

  ngOnDestroy(): void {
    this.backButtonSubscription.unsubscribe();
  }

  public async checkboxChanged(): Promise<void> {
    const loading = await this.loadingController.create({
      message: this.translate.instant('note-list.loading-filters'),
    });
    await loading.present();

    await this.setFilteredNotes();

    await loading.dismiss();
  }

  public async btnDeleteCommentClick(note: NoteViewModel): Promise<void> {
    const handler: (alertData: any) => void = async (alertData) => {
      // console.log('DELETING NOTE', note);

      const index = this.filteredNotes.findIndex(p => p.historyId === note.historyId);
      this.filteredNotes.splice(index, 1);
      const index2 = this.allNotes.findIndex(p => p.historyId === note.historyId);
      this.allNotes.splice(index2, 1);

      const task = this.calendarTaskService.getTask(note.calendarTaskId);
      const taskHistoryIndex = task.Histories.findIndex(p => p.TaskHistoryId === note.historyId);
      const history = task.Histories[taskHistoryIndex];

      history.Comment = '';
      history.UpdateDate = new Date();

      await this.historyService.updateTaskHistory(history);
    };

    const alertOptions: AlertOptions = this.alertService.getDeleteNoteAlertOptions(handler);
    const alert = await this.alertCtrl.create(alertOptions);

    await alert.present();

    this.setBackButtonAlert(alert);
    await alert.onDidDismiss();
    this.resetBackButton();
  }

  public async keywordChanged(): Promise<void> {
    if (this.keywordSearch.length > 1) {
      await this.setFilteredNotes();
    }
  }

  public async textClick(note: NoteViewModel) {
    const handler: (alertData: any) => void = async (alertData) => {
      // console.log('UPDATE NOTE', alertData.Note);

      // Update NoteViewModel
      const index = this.filteredNotes.findIndex(p => p.historyId === note.historyId);
      this.filteredNotes[index].text = alertData.Note;

      // Update Note
      const task = this.calendarTaskService.getTask(note.calendarTaskId);
      const taskHistoryIndex = task.Histories.findIndex(p => p.TaskHistoryId === note.historyId);
      const history = task.Histories[taskHistoryIndex];

      history.Comment = alertData.Note;
      history.UpdateDate = new Date();

      await this.historyService.updateTaskHistory(history);

      // console.log('NOTE UPDATED', JSON.stringify(history));

      // TODO : We need to update the cardViewModels that changed
    };

    const alertOptions: AlertOptions = this.alertService.getEditNoteAlertOptions(handler, note.text);
    const alert = await this.alertCtrl.create(alertOptions);

    await alert.present();

    this.setBackButtonAlert(alert);
    await alert.onDidDismiss();
    this.resetBackButton();
  }

  public async closePopup(): Promise<void> {
    await this.modalController.dismiss(false, null, ModalService.ModalIds.Notes);
  }

  public initializeFilters() {
    for (const task of this.calendarTaskService.getAllTasks()) {
      for (const history of task.Histories) {
        if (history.Comment != null) {
          const filter = new TaskFilterViewModel();
          filter.calendarTaskId = task.CalendarTaskId;
          filter.isChecked = false;
          filter.Name = task.Name;
          this.taskFilters.push(filter);
          break;
        }
      }
    }
  }

  public initializeAllNotes() {
    this.allNotes = [];

    for (const task of this.calendarTaskService.getAllTasks()) { // TODO : Might need to sort ?
      for (const history of task.Histories) {
        if (history.Comment != null) {
          const note = new NoteViewModel();
          if (history.DoneWorkDate == null) {
            // console.log('+++++++ workdatedone is null');
            continue;
          }
          note.date = history.DoneWorkDate;
          note.dateText = DateUtils.getLocalMysqlDateString(history.DoneWorkDate); // TODO: Use Datepipe instead ?
          note.historyId = history.TaskHistoryId;
          note.taskName = task.Name;
          note.calendarTaskId = task.CalendarTaskId;
          note.text = history.Comment;
          note.result = this.calendarTaskService.getTaskResultFromHistory(task, history);
          note.showCheckedBox = this.calendarTaskService.isDoneAtDate(task, note.date, history) &&
                                task.isBinary();

          if (!note.showCheckedBox) {
            note.showBrokenHeart = this.calendarTaskService.isSkipped(history);
          } else {
            note.showBrokenHeart = false;
          }

          note.showText = this.calendarTaskService.isDone(task, history) &&
                          !task.isBinary();

          this.allNotes.push(note);
        }
      }
    }
  }

  public async setFilteredNotes(): Promise<void> {
    /*const loading = await this.loadingController.create({
      message: this.translate.instant('note-list.loading-filters'),
    });
    loading.present();*/

    const startTime = this.startDate.getTime();
    const endTime = this.endDate.getTime();

    // console.log('SETTING FILTERED NOTES', this.startDate, this.endDate);

    const calendarTaskIdsSelected: string[] = [];

    for (const taskFilter of this.taskFilters) {
      if (taskFilter.isChecked) {
        calendarTaskIdsSelected.push(taskFilter.calendarTaskId);
      }
    }

    if (this.keywordSearch.length > 0) {
      if (calendarTaskIdsSelected.length > 0) { // Keyword and tasks selected
        this.filteredNotes = this.allNotes.filter(p => p.date.getTime() >= startTime &&
                                                       p.date.getTime() <= endTime &&
                                                       calendarTaskIdsSelected.some(t => t === p.calendarTaskId) &&
                                                       p.text.includes(this.keywordSearch));
      } else { // Keyword and no task selected
        this.filteredNotes = this.allNotes.filter(p => p.date.getTime() >= startTime &&
                                                     p.date.getTime() <= endTime &&
                                                     p.text.includes(this.keywordSearch));
      }
    } else { // No keyword selected
      this.filteredNotes = this.allNotes.filter(p => p.date.getTime() >= startTime &&
                                                       p.date.getTime() <= endTime &&
                                                       calendarTaskIdsSelected.some(t => t === p.calendarTaskId));
    }

    // loading.dismiss();

    // console.log('FILTERED NOTES : ', this.filteredNotes);
  }

  private setBackButtonAlert(alert: HTMLIonAlertElement) {
    this.backButtonSubscription.unsubscribe();
    this.backButtonSubscription = this.platform.backButton.subscribe(async () => {
      await alert.dismiss();
    });
  }

  private resetBackButton() {
    if (this.backButtonSubscription != null) {
      this.backButtonSubscription.unsubscribe();
    }

    this.backButtonSubscription = this.platform.backButton.subscribe(async () => {
      await this.closePopup();
    });
  }
}

export class NoteViewModel {
  public historyId: string;
  public text: string;
  public dateText: string;
  public date: Date;
  public taskName: string;
  public calendarTaskId: string;
  public result: string;
  public showBrokenHeart: boolean;
  public showText: boolean;
  public showCheckedBox: boolean;
}

export class TaskFilterViewModel {
  public calendarTaskId: string;
  public Name: string;
  public isChecked: boolean;
}
