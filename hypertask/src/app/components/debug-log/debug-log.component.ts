import { Component, OnInit, OnDestroy } from '@angular/core';
import { ILogger } from 'src/app/interfaces/i-logger';
import { ModalController, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-debug-log',
  templateUrl: './debug-log.component.html',
  styleUrls: ['./debug-log.component.scss'],
})
export class DebugLogComponent implements OnInit, OnDestroy {

  public currentLogs: string[];
  private backButtonSubscription: Subscription;

  constructor(private logger: ILogger,
              private modal: ModalController,
              private platform: Platform) { }

  ngOnInit() {
    this.currentLogs = this.logger.getDebugLogs();
    this.backButtonSubscription = this.platform.backButton.subscribe(async () => {
      await this.closePopup();
    });
  }

  public async closePopup() {
    return await this.modal.dismiss(null, null, ModalService.ModalIds.Logs);
  }

  public ngOnDestroy(): void {
    this.backButtonSubscription.unsubscribe();
  }

}
