import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController, LoadingController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { DTOBugReport } from 'src/app/models/DTO/dto-bug-report';
import { BugReportType } from 'src/app/models/Core/bug-report-type.enum';
import { BugReportService } from 'src/app/services/bug-report.service';
import { ILogger } from 'src/app/interfaces/i-logger';
import { Subscription } from 'rxjs';
import { IUserService } from 'src/app/interfaces/i-user-service';
import { ModalService } from 'src/app/services/modal.service';
import ThreadUtils from 'src/app/shared/thread.utils';
import { timeout } from 'rxjs/operators';
@Component({
  selector: 'app-send-feedback',
  templateUrl: './send-feedback.component.html',
  styleUrls: ['./send-feedback.component.scss'],
})
export class SendFeedbackComponent implements OnInit, OnDestroy {

  constructor(private modalController: ModalController,
              private loadingController: LoadingController,
              private translate: TranslateService,
              private bugReportService: BugReportService,
              private userService: IUserService,
              private logger: ILogger,
              private platform: Platform) { }

  public bugReport: DTOBugReport;
  public showBugsTab: boolean;
  public showSurveyTab: boolean;
  public showSupportTab: boolean;

  private backButtonSubscription: Subscription;

  ngOnInit() {
    this.bugReport = new DTOBugReport();
    this.bugReport.BugReportType = BugReportType.Bug;

    this.backButtonSubscription = this.platform.backButton.subscribe(async () => {
      await this.modalController.dismiss(null, null, ModalService.ModalIds.Feedback);
    });

    this.showSurveyTab = true;
    this.showBugsTab = false;
    this.showSupportTab = false;
  }

  ngOnDestroy(): void {
    this.backButtonSubscription.unsubscribe();
  }

  public async btnSendClick() {
    if (this.bugReport.Title == null || this.bugReport.Title.length < 10) {
      alert(this.translate.instant('menu.title-too-short'));
      return;
    }

    const loading = await this.loadingController.create({
      message: this.translate.instant('menu.sending-feedback'),
    });
    loading.present();

    this.bugReport.UserId = await this.userService.getCurrentUserId();
    this.bugReport.InsertDate = new Date();
    const response = await this.bugReportService.SendReport(this.bugReport);
    loading.dismiss();
    if (response === true) {
      await this.modalController.dismiss(null, null, ModalService.ModalIds.Feedback);
      return;
    } else {
      this.logger.logEvent('Bug report failed');
      return false;
    }
  }

  public async btnCancelClick() {
    // this.logger.logDebug('Cancelclick');
    await this.modalController.dismiss(null, null, ModalService.ModalIds.Feedback);
  }

  public async feedbackTypeChanged(data: any) {
    if (data.detail.value === 'bug') {
      this.bugReport.BugReportType = BugReportType.Bug;
      this.showBugsTab = true;
      this.showSurveyTab = false;
      this.showSupportTab = false;

      // Select first input
      try {
        const firstInput: any = document.querySelector('ion-modal input');
        // console.log('firstinput:', firstInput);
        setTimeout(() => {
          firstInput.focus();
        }, 250);
      } catch (error) {
        // console.log('error', error);
        this.logger.logError(error);
      }
    } else if (data.detail.value === 'feedback') {
      this.bugReport.BugReportType = BugReportType.Survey;
      this.showSurveyTab = true;
      this.showBugsTab = false;
      this.showSupportTab = false;
    } else {
      this.bugReport.BugReportType = BugReportType.Support;
      this.showSurveyTab = false;
      this.showBugsTab = false;
      this.showSupportTab = true;
    }
  }

  public btnSurveyClick() {
    window.open('https://www.surveymonkey.com/r/JD8K3N5', '_system');
  }

  public async btnSupportClick() {
    window.open('mailto:hypertaskhelp@gmail.com', '_system');
  }
}
