import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { TaskGroup } from 'src/app/models/Core/task-group';
import { EventService, EventData } from 'src/app/services/event.service';
import { ModalService } from 'src/app/services/modal.service';
import { GroupEditComponent } from '../group-edit/group-edit.component';
import { TaskCreateComponent } from '../task-create/task-create.component';

@Component({
  selector: 'app-group-popover',
  templateUrl: './group-popover.component.html',
  styleUrls: ['./group-popover.component.scss'],
})
export class GroupPopoverComponent implements OnInit {

  @Input() group: TaskGroup;

  public skipAllBtnShown: boolean = true;
  public postponeAllBtnShown: boolean = true;

  constructor(private popoverController: PopoverController,
              private eventService: EventService,
              private modalService: ModalService) { }

  ngOnInit() {}

  public async btnCreateTaskClick() {
    await this.popoverController.dismiss();
    await this.modalService.showCreateTaskModal(TaskCreateComponent, this.group.GroupId);
  }

  public async btnEditGroupClick() {
    const result = await this.modalService.showEditGroupModal(GroupEditComponent, this.group);
    if (result === true) {
      await this.popoverController.dismiss();
    }
  }

  public async btnSkipAllClick() {
    this.eventService.emit(new EventData(EventService.EventIds.SkipAllGroup + this.group.GroupId, null));
    await this.popoverController.dismiss();
  }

  public async btnPostponeAllClick() {
    this.eventService.emit(new EventData(EventService.EventIds.PostponeAllGroup + this.group.GroupId, null));
    await this.popoverController.dismiss();
  }
}
