import { CalendarTask } from './calendar-task';
import { DTOTaskGroup } from '../DTO/dto-task-group';
import { TranslateService } from '@ngx-translate/core';
import { InvalidTaskGroupError } from '../Exceptions/InvalidTaskGroupError';

export class TaskGroup {
  public GroupId: string;
  public UserId: string;
  public ColorHex: string = '#D1D1D1';
  public Name: string;
  public Position: number;
  public InitialPosition: number;
  public InsertDate: Date;
  public UpdateDate: Date;
  public Void: boolean = false;
  public VoidDate: Date;
  public Tasks: CalendarTask[] = []; // Put this into a viewModel ?
  public isVisible: boolean = true; // Put this into viewModel?
  public isExpanded: boolean = false;
  public isUnassigned: boolean;
  public Synced: boolean = false;
  public Sent: boolean = false;
  public RecurringDefault: boolean = false;

  // only for viewmodel
  public ProgressText: string;
  public ProgressDone: number;
  public ProgressTotal: number;

  public static fromDTO(dto: DTOTaskGroup): TaskGroup {
    const group = new TaskGroup();
    group.Name = dto.Name;
    group.ColorHex = dto.ColorHex;
    group.GroupId = dto.GroupId;
    group.InsertDate = dto.InsertDate == null ? null : new Date(dto.InsertDate);
    group.Name = dto.Name;
    group.Position = dto.Position;
    group.InitialPosition = dto.InitialPosition;
    if (group.InitialPosition == null) {
      group.InitialPosition = group.Position;
    }
    group.UpdateDate = dto.UpdateDate == null ? null : new Date(dto.UpdateDate);
    group.UserId = dto.UserId;
    group.Void = dto.Void;
    group.Synced = dto.Synced;
    group.Sent = dto.Sent;
    group.RecurringDefault = dto.RecurringDefault;

    return group;
  }

  public toDTO(): DTOTaskGroup {
    const group = new DTOTaskGroup();
    group.Name = this.Name;
    group.ColorHex = this.ColorHex;
    group.GroupId = this.GroupId;
    group.InsertDate = this.InsertDate == null ? null : new Date(this.InsertDate);
    group.Name = this.Name;
    group.Position = this.Position;
    group.InitialPosition = this.InitialPosition;
    if (group.InitialPosition == null) {
      group.InitialPosition = group.Position;
    }
    group.UpdateDate = this.UpdateDate == null ? null : new Date(this.UpdateDate);
    group.UserId = this.UserId;
    group.Void = this.Void;
    group.Synced = this.Synced;
    group.Sent = this.Sent;
    group.RecurringDefault = this.RecurringDefault;

    return group;
  }

  public validate(translate: TranslateService) {
    if (this.Name == null || this.Name.length === 0 || this.Name.length > 200) {
      throw new InvalidTaskGroupError(translate.instant('group-create.msg-group-name-invalid'));
    }
  }
}
