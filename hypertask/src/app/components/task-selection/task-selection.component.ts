import { Component, OnInit, OnDestroy } from '@angular/core';
import { SelectableTask } from 'src/app/models/Core/selectable-task';
import { SelectableTaskService } from 'src/app/services/selectable-task.service';
import { DayOfWeek } from 'src/app/models/Core/day-of-week.enum';
import { ModalController, LoadingController, Platform } from '@ionic/angular';
import { CalendarTask } from 'src/app/models/Core/calendar-task';
import { CalendarTaskService } from 'src/app/services/calendar-task.service';
import { TranslateService } from '@ngx-translate/core';
import { ILogger } from 'src/app/interfaces/i-logger';
import { Subscription } from 'rxjs';
import NumberUtils from 'src/app/shared/number-utils';
import { IUserService } from 'src/app/interfaces/i-user-service';
import { TaskGroup } from 'src/app/models/Core/task-group';
import { ModalService } from 'src/app/services/modal.service';
import { TaskFrequency } from 'src/app/models/Core/task-frequency.enum';

@Component({
  selector: 'app-task-selection',
  templateUrl: './task-selection.component.html',
  styleUrls: ['./task-selection.component.scss'],
})
export class TaskSelectionComponent implements OnInit, OnDestroy {

  public selectableTasks: SelectableTask[] = [];
  public selectableTasksDaily: SelectableTask[] = [];
  public selectableTasksSpecial: SelectableTask[] = [];
  public selectedTasks: SelectableTask[] = [];
  public showAssignedDate: boolean;

  private backButtonSubscription: Subscription;

  public daysOfWeek: DayOfWeek[] = [
    DayOfWeek.Monday,
    DayOfWeek.Tuesday,
    DayOfWeek.Wednesday,
    DayOfWeek.Thursday,
    DayOfWeek.Friday,
    DayOfWeek.Saturday,
    DayOfWeek.Sunday
  ];

  constructor(private selectableTaskService: SelectableTaskService,
              private modalController: ModalController,
              private calendarTaskService: CalendarTaskService,
              private loadingController: LoadingController,
              private userService: IUserService,
              private translate: TranslateService,
              private logger: ILogger,
              private platform: Platform) { }

  ngOnInit() {
    this.selectableTasks = this.selectableTaskService.getAllSelectableTasks();
    this.selectableTasksSpecial = this.selectableTasks.filter(p => p.AdditionnalTask != null);
    this.selectableTasksDaily = this.selectableTasks.filter(p => p.Frequency === TaskFrequency.Daily &&
                                                                 p.AdditionnalTask == null);

    this.backButtonSubscription = this.platform.backButton.subscribe(async () => {
      await this.closePopup();
    });
  }

  ngOnDestroy(): void {
    this.backButtonSubscription.unsubscribe();
  }

  public async closePopup(): Promise<void> {
    await this.modalController.dismiss(false, null, ModalService.ModalIds.TaskSelection);
  }

  public async btnSaveClick(): Promise<void> {
    const loading = await this.loadingController.create({
      message: this.translate.instant('task-selection.msg-saving-tasks'),
    });
    await loading.present();

    // This only works for Welcome
    const morningRoutinesGroup = new TaskGroup();
    morningRoutinesGroup.GroupId = NumberUtils.getRandomId();
    morningRoutinesGroup.InsertDate = new Date();
    morningRoutinesGroup.UserId = await this.userService.getCurrentUserId();
    morningRoutinesGroup.Position = 1;
    morningRoutinesGroup.InitialPosition = 500;
    morningRoutinesGroup.RecurringDefault = true;
    morningRoutinesGroup.Name = this.translate.instant('group-create.morning-routine-group');
    // console.log('Morning GROUP = ', morningRoutinesGroup);

    const TodoGroup = new TaskGroup();
    TodoGroup.GroupId = NumberUtils.getRandomId();
    TodoGroup.InsertDate = new Date();
    TodoGroup.UserId = await this.userService.getCurrentUserId();
    TodoGroup.Position = 2;
    TodoGroup.InitialPosition = 500;
    TodoGroup.RecurringDefault = false;
    TodoGroup.Name = this.translate.instant('group-create.todo-group');
    // console.log('Todo GROUP = ', TodoGroup);
    // SET DEFAULT NonRecurring

    const regularRoutinesGroup = new TaskGroup();
    regularRoutinesGroup.GroupId = NumberUtils.getRandomId();
    regularRoutinesGroup.InsertDate = new Date();
    regularRoutinesGroup.UserId = await this.userService.getCurrentUserId();
    regularRoutinesGroup.Position = 3;
    regularRoutinesGroup.InitialPosition = 500;
    regularRoutinesGroup.RecurringDefault = true;
    regularRoutinesGroup.Name = this.translate.instant('group-create.regular-routine-group');
    // console.log('Regular GROUP = ', regularRoutinesGroup);
    // SET DEFAULT Recurring

    const eveningRoutinesGroup = new TaskGroup();
    eveningRoutinesGroup.GroupId = NumberUtils.getRandomId();
    eveningRoutinesGroup.InsertDate = new Date();
    eveningRoutinesGroup.UserId = await this.userService.getCurrentUserId();
    eveningRoutinesGroup.Position = 4;
    eveningRoutinesGroup.InitialPosition = 500;
    eveningRoutinesGroup.RecurringDefault = true;
    eveningRoutinesGroup.Name = this.translate.instant('group-create.evening-routine-group');
    // console.log('Evening GROUP = ', eveningRoutinesGroup);

    let newGroups = false;
    if (this.calendarTaskService.allGroups.filter(p => p.GroupId !== CalendarTaskService.UnassignedId).length === 0) {
      // console.log('NEW GROUPS');
      newGroups = true;
      await this.calendarTaskService.insertGroup(morningRoutinesGroup);
      await this.calendarTaskService.insertGroup(TodoGroup);
      await this.calendarTaskService.insertGroup(regularRoutinesGroup);
      await this.calendarTaskService.insertGroup(eveningRoutinesGroup);
      await this.userService.setDefaultRecurringGroupId(regularRoutinesGroup.GroupId);
      await this.userService.setDefaultNonRecurringGroupId(TodoGroup.GroupId);
    }/* else {
      console.log('NOT NEW GROUPS', this.calendarTaskService.allGroups);
    }*/

    const toInsertTasks: CalendarTask[] = [];
    for (const selectedTask of this.selectedTasks) {
      const calendarTask = new CalendarTask();
      calendarTask.Name = selectedTask.Name;
      calendarTask.ResultType = selectedTask.ResultType;
      calendarTask.Frequency = selectedTask.Frequency;
      calendarTask.AbsolutePosition = selectedTask.AbsolutePosition;
      calendarTask.RequiredDays = this.daysOfWeek;
      calendarTask.UserId = (await this.userService.getCurrentUser()).UserId;
      calendarTask.InsertDate = new Date();
      calendarTask.CalendarTaskId = NumberUtils.getRandomId();

      if (newGroups === true) {
        if (selectedTask.GroupName === SelectableTaskService.MorningRoutinesGroupName) {
          // console.log('MORNING', calendarTask);
          calendarTask.GroupId = morningRoutinesGroup.GroupId;
        }
        if (selectedTask.GroupName === SelectableTaskService.RegularRoutinesGroupName) {
          // console.log('REGULAR', calendarTask);
          calendarTask.GroupId = regularRoutinesGroup.GroupId;
        }
        if (selectedTask.GroupName === SelectableTaskService.EveningRoutinesGroupName) {
          // console.log('EVENING', calendarTask);
          calendarTask.GroupId = eveningRoutinesGroup.GroupId;
        }
      }/* else {
        console.log('NEWGROUP1 FALSE');
      }*/

      if (selectedTask.AdditionnalTask != null) {
        // console.log('ADDITIONNAL TASK : ', selectedTask.AdditionnalTask);
        const calendarTask2 = new CalendarTask();
        calendarTask.Name = selectedTask.AdditionnalTask.Task1Name;
        calendarTask.StatType = selectedTask.AdditionnalTask.StatType1;
        calendarTask2.Name = selectedTask.AdditionnalTask.Task2Name;
        calendarTask2.ResultType = selectedTask.ResultType;
        calendarTask2.Frequency = selectedTask.Frequency;
        calendarTask2.AbsolutePosition = selectedTask.AdditionnalTask.AbsolutePositionTask2;
        calendarTask2.RequiredDays = this.daysOfWeek;
        calendarTask2.StatType = selectedTask.AdditionnalTask.StatType2;
        calendarTask2.UserId = (await this.userService.getCurrentUser()).UserId;
        calendarTask2.CalendarTaskId = NumberUtils.getRandomId();

        // ADDITIONNAL TASKS ARE ALWAYS IN THE EVENING
        if (newGroups === true) {
          calendarTask2.GroupId = eveningRoutinesGroup.GroupId;
        } /*else {
          console.log('NEWGROUP2 FALSE');
        }*/

        toInsertTasks.push(calendarTask2);
        // await this.calendarTaskService.insertCalendarTask(calendarTask2);
      }

      // console.log('insert task', calendarTask);
      toInsertTasks.push(calendarTask);
      // await this.calendarTaskService.insertCalendarTask(calendarTask);
    }

    await this.calendarTaskService.insertCalendarTasks(toInsertTasks);
    // this.eventService.emit(new EventData(EventService.EventIds.PrioritizeVsExecute, null));
    await loading.dismiss();
    await this.closePopup();
  }

  public taskSelected(data) {
    // this.logger.logEvent('taskSelected', { key: 'data', value: JSON.stringify(data)});

    const toRemoveIndexes: number[] = [];
    for (const task of this.selectableTasks) {
      const receivedChecked = data[0] as boolean;
      const receivedTask = data[1] as SelectableTask;

      if (task === receivedTask) {
        if (receivedChecked) {
          this.selectedTasks.push(task);
        } else {
          const taskIndex = this.selectedTasks.findIndex(p => p === task);
          toRemoveIndexes.push(taskIndex);
        }
      }
    }

    for (const index of toRemoveIndexes) {
      this.selectedTasks.splice(index, 1);
    }

    // this.logger.logEvent('taskSelected', { key: 'this.selectedTasks', value: JSON.stringify(this.selectedTasks)});
  }
}
