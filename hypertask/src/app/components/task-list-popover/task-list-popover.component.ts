import { Component, OnInit } from '@angular/core';
import { LoadingController, PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { EventData, EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-task-list-popover',
  templateUrl: './task-list-popover.component.html',
  styleUrls: ['./task-list-popover.component.scss'],
})
export class TaskListPopoverComponent implements OnInit {

  public skipAllBtnShown: boolean = true;

  constructor(private popoverController: PopoverController,
              private eventService: EventService,
              private loadingController: LoadingController,
              private translate: TranslateService) { }

  ngOnInit() {}

  public async btnSkipAllClick() {
    const loading = await this.loadingController.create({
      message: this.translate.instant('task-list.msg-skipping-all'),
      id: 'refreshSpinner'
    });
    await loading.present();
    this.eventService.emit(new EventData(EventService.EventIds.SkipAll, null));
    await loading.dismiss();
    await this.popoverController.dismiss();
  }
}
