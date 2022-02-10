import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Platform, ModalController } from '@ionic/angular';
import { TaskGroup } from 'src/app/models/Core/task-group';
import { CalendarTaskService } from 'src/app/services/calendar-task.service';
import { ModalService } from 'src/app/services/modal.service';
import { GroupCreateComponent } from '../group-create/group-create.component';
import { GroupEditComponent } from '../group-edit/group-edit.component';

@Component({
  selector: 'app-group-list',
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.scss'],
})
export class GroupListComponent implements OnInit, OnDestroy {

  private backButtonSubscription: Subscription;

  constructor(private platform: Platform,
              private modalController: ModalController,
              public calendarTaskService: CalendarTaskService,
              private modalService: ModalService) { }

  ngOnInit() {
    this.resetBackButton();

    this.refreshGroupList();
  }

  private refreshGroupList() {
    this.calendarTaskService.reorderAllRamGroups();
  }

  public async closePopup(): Promise<void> {
    await this.modalController.dismiss(false, null, ModalService.ModalIds.Groups);
  }

  ngOnDestroy(): void {
    this.backButtonSubscription.unsubscribe();
  }

  public async addGroupButtonClick() {
    this.backButtonSubscription.unsubscribe();
    const result = await this.modalService.showCreateGroupModal(GroupCreateComponent);
    this.resetBackButton();
    if (result === true) {
      this.refreshGroupList();
    }
  }

  public async btnGroupHeaderClick(group: TaskGroup) {
    const result = await this.modalService.showEditGroupModal(GroupEditComponent, group);
    if (result === true) {
      this.refreshGroupList();
    }
  }

  private setBackButtonModal(picker: HTMLIonPickerElement) {
    this.backButtonSubscription.unsubscribe();
    this.backButtonSubscription = this.platform.backButton.subscribe(async () => {
      await picker.dismiss();
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

