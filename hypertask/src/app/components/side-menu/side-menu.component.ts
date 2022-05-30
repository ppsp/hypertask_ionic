import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuController, LoadingController, AlertController, Platform, ModalController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { ChangelogService } from 'src/app/services/changelog.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { TimerService } from 'src/app/services/timer.service';
import { DataSyncServerService } from 'src/app/services/data-sync-server-service';
import { UserConfig } from 'src/app/models/Core/user-config';
import { EventService, EventData } from 'src/app/services/event.service';
import { ModalService } from 'src/app/services/modal.service';
import { CancellationToken } from 'src/app/services/data-sync-2.service';
import { ILocalStorageService } from 'src/app/interfaces/i-local-storage-service';
import { ILogger } from 'src/app/interfaces/i-logger';
import { IDataSyncLocalService } from 'src/app/interfaces/i-data-sync-local-service';
import { IUserService } from 'src/app/interfaces/i-user-service';
import { SendFeedbackComponent } from '../send-feedback/send-feedback.component';
import { NoteListComponent } from '../note-list/note-list.component';
import { TaskSelectionComponent } from '../task-selection/task-selection.component';
import { UserSettingsComponent } from '../user-settings/user-settings.component';
import { PrivacyComponent } from '../privacy/privacy.component';
import { DebugLogComponent } from '../debug-log/debug-log.component';
import { GroupListComponent } from '../group-list/group-list.component';
import { TermsComponent } from '../terms/terms.component';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
})
export class SideMenuComponent implements OnInit, OnDestroy {
  public appVersionText: string = '';
  public packageName: string = '';
  public versionCode: string | number = '';
  public appName: string = '';
  public showCheckForUpdateBtn: boolean = false;
  public showViewChangelogBtn: boolean = false;
  public showDevMode: boolean = false;
  public showRefresh: boolean = false;

  private backButtonSubscription: Subscription;

  constructor(private menu: MenuController,
              private local: ILocalStorageService,
              private loadingController: LoadingController,
              private alertCtrl: AlertController,
              private logger: ILogger,
              //private appVersion: AppVersion,
              private platform: Platform,
              //private appUpdate: AppUpdate,
              private changeLog: ChangelogService,
              private translate: TranslateService,
              private modalController: ModalController,
              private serverDataSync: DataSyncServerService,
              private localDataSync: IDataSyncLocalService,
              private userService: IUserService,
              private timerService: TimerService,
              private eventService: EventService,
              private modalService: ModalService) { }

  async ngOnInit() {
    try {
      // console.log('[ SIDE MENU AFTER INIT STARTED ]', new Date().toISOString());
      /*console.log('%%%% LOADING SIDE Menu, WAITING FOR PLATFORM %%%% ' + new Date().toISOString(),
                  JSON.stringify(UserService.currentUser), UserService.currentUserId);*/
      await this.platform.ready();
      // console.log('%%%% LOADING SIDE Menu, WAITING FOR USER %%%% ' + new Date().toISOString());
      await this.userService.awaitUserReady(true);
      // console.log('%%%% USER READY Side Menu %%%%', UserService.currentUser, UserService.currentUserId);
      this.showViewChangelogBtn = true;
      
      /*if (this.platform.is('cordova')) { //TODO : CAPACITOR
        this.showCheckForUpdateBtn = true;
        this.appVersionText = await this.appVersion.getVersionNumber();
        this.versionCode = await this.appVersion.getVersionCode();
        this.appName = await this.appVersion.getAppName();
        this.packageName = await this.appVersion.getPackageName();
      }*/

      this.backButtonSubscription = this.platform.backButton.subscribe(() => {
        this.menu.close();
      });

      //const userId = await this.userService.getCurrentUserId();
      // if (userId === 'Hwnf3hxuFjgIai5QxvyDNdsCZFB2' || userId === 'Ashvg7vzEhOL7gdZDeVBHzbYp4C2') {
        // console.log('DEV MODE ENABLED');
      this.showDevMode = true; // TODO : Deactivate for prod
      // }

      // Show Refresh if user syncs to cloud
      // console.log('ENABLE1');
      if (this.userService.getConfig(UserConfig.EnableCloudSyncKey) === true) {
        this.showRefresh = true;
      }

      // console.log('[ SIDE MENU AFTER INIT ENDED ]', new Date().toISOString());

    } catch (error) {
      // console.log('error01', error);
      this.logger.logError(error);
      alert(this.translate.instant('menu.error-version'));
      alert(error);
    }
  }

  ngOnDestroy(): void {
    this.backButtonSubscription.unsubscribe();
  }

  public btnCloseMenuClick(): void {
    this.menu.close();
  }

  public async btnReloadFromServerClick(): Promise<void> {
    //console.log('RELOADING STARTING');
    // console.log('refresh');
    const loading = await this.loadingController.create({
      message: this.translate.instant('menu.reloading-tasks'),
      id: 'reload-server'
    });
    await loading.present();

    let canReloadDataSynced = await this.serverDataSync.allDataIsSynced();
    let canReloadTimerOn = !this.timerService.anyTimerOn();

    // console.log('canReloadDataSynced', canReloadDataSynced);
    // console.log('canReloadTimerOn', canReloadTimerOn);

    if (canReloadDataSynced === false) {
      await loading.dismiss();
      // console.log('refresh2');
      canReloadDataSynced = await this.showReloadConfirmationDataSyncAlert();
      if (canReloadDataSynced === false) {
        return;
      }
    }

    if (canReloadTimerOn === false) {
      this.logger.logDebug('STILL TIMERS : ',
        JSON.stringify(this.timerService.allTimers.filter(p => p.isDone === false &&
                                                               p.isPaused === false)));

      await loading.dismiss();
        // console.log('refresh3');
      canReloadTimerOn = await this.showReloadConfirmationTimerAlert();
      if (canReloadTimerOn === false) {
        return;
      } else {
        await loading.present();
      }
    }

    await this.reloadAllTasks();
    await loading.dismiss();

    // console.log('RELOADING DONE');
  }

  public async btnSendDataToServerClick(): Promise<void> {
    const loading = await this.loadingController.create({
      message: this.translate.instant('menu.msg-sending-tasks'),
      id: 'upload-server'
    });
    await loading.present();
              
    this.eventService.emit(new EventData(EventService.EventIds.SyncRequired, null));

    await loading.dismiss();
  }

  public async btnLogoutClick(): Promise<void> {
    const loading = await this.loadingController.create({
      message: this.translate.instant('menu.msg-logging-out')
    });
    await loading.present();
    this.logger.logDebug('logoutClick, terminating', new Date().toISOString());
    await this.local.terminate();
    DataSyncServerService.GetLatestInvalid = true;
    this.logger.logDebug('terminated', new Date().toISOString());
    await this.userService.logout();
    this.logger.logDebug('logged out', new Date().toISOString());
    location.reload();
  }

  public async btnShowDebugLogs(): Promise<void> {
    await this.modalService.showLogsModal(DebugLogComponent); //TODO COMPONENT
  }

  public btnExitAppClick(): void {
    const appString = 'app';
    navigator[appString].exitApp();
  }

  public async btnCheckForUpdateClick(): Promise<void> {
    const loading = await this.loadingController.create({
      message: this.translate.instant('menu.checking-update'),
    });

    const updateUrl = environment.apiUpdateXmlUrl;

    try {
      await loading.present();
      /*const result = await this.appUpdate.checkAppUpdate(updateUrl); TODO CAPACITOR
      alert(this.translate.instant('menu.update-successful') + ' : ' + result.msg);*/
    } catch (error) {
      // console.log('error02');
      this.logger.logError(error);
      alert(this.translate.instant('menu.update-failed'));
      alert(error.msg);
    } finally {
      await loading.dismiss();
    }
  }

  public async btnChangeLogClick(): Promise<void> {
    this.changeLog.showAllChangeLogs();
  }

  public async btnBugReportClick(): Promise<void> {
    await this.modalService.showFeedbackModal(SendFeedbackComponent);
  }

  public async btnNoteClick(): Promise<void> {
    await this.modalService.showNotesModal(NoteListComponent);
  }

  public async btnSelectNewTasksClick(): Promise<void> {
    await this.modalService.showTaskSelectionModal(TaskSelectionComponent);
  }

  public async btnUserSettingsClick() {
    await this.modalService.showUserSettingsModal(UserSettingsComponent);
  }

  public async btnPrivacyClick() {
    await this.modalService.showPrivacyModal(PrivacyComponent);
  }

  public async btnResetLocalDatabase() {
    const loading = await this.loadingController.create({
      message: this.translate.instant('menu.clear-database'),
    });
    await loading.present();

    await this.local.clear();

    await loading.dismiss();
  }

  public async btnTermsClick() {
    await this.modalService.showTermsModal(TermsComponent);
  }

  public async btnShowUnsyncedData() {
    const loading = await this.loadingController.create({
      message: this.translate.instant('menu.msg-loading-unsynced-data')
    });
    await loading.present();
    const localData = await this.serverDataSync.getUnsynchronized();
    await loading.dismiss();
    alert('LOCAL DATA : ' + localData);

    // console.log('LOCAL DATA : ', localData);
    
    await loading.present();
    const queueData = await this.localDataSync.getUnsynchronized();
    await loading.dismiss();

    // console.log('QUEUE DATA : ', queueData);
    alert('QUEUE DATA : ' + queueData);
  }

  public async btnResumeClick() {
    this.eventService.emit(new EventData(EventService.EventIds.Resume, null));
  }

  public async btnCalendarClick() {
    /*const modal = await this.modalController.create({
      component: CalendarModeComponent, TODO component
      backdropDismiss: false,
    });

    modal.present();
    await modal.onDidDismiss();*/
  }

  public emptyStorage(): void {
    this.local.clear();
  }

  public async btnTaskGroupsClick() {
    await this.modalService.showGroupsModal(GroupListComponent);
  }

  public async btnWalkthroughClick() {
    this.eventService.emit(new EventData(EventService.EventIds.Walkthrough, null));
    this.menu.close();
  }

  private async reloadAllTasks(): Promise<void> {
    console.log("reloading all tasks from server");
    this.logger.logEvent('reloading all tasks from server');
    try {
      await this.serverDataSync.reloadAllGroupsAndTasksServer(new CancellationToken());
      this.eventService.emit(new EventData(EventService.EventIds.ProgressBar, null));
      this.menu.close();
    } catch (error) {
      this.logger.logError(new Error('Unable to reload tasks from server : ' + error.message));
      alert(this.translate.instant('menu.unable-to-reload'));
    }
  }

  private async showReloadConfirmationDataSyncAlert(): Promise<boolean> {
    let resolveFunction: (confirm: boolean) => void;
    const promise = new Promise<boolean>(resolve => {
      resolveFunction = resolve;
    });
    const alert = await this.alertCtrl.create({
      message: this.translate.instant('alert.msg-unsynchronised'),
      backdropDismiss: false,
      buttons: [
        {
          text: this.translate.instant('alert.lbl-no'),
          handler: () => resolveFunction(false)
        },
        {
          text: this.translate.instant('alert.lbl-yes'),
          handler: () => resolveFunction(true)
        }
      ]
    });
    await alert.present();
    return promise;
  }

  private async showReloadConfirmationTimerAlert(): Promise<boolean> {
    let resolveFunction: (confirm: boolean) => void;
    const promise = new Promise<boolean>(resolve => {
      resolveFunction = resolve;
    });
    const alert = await this.alertCtrl.create({
      message: this.translate.instant('alert.msg-timers'),
      backdropDismiss: false,
      buttons: [
        {
          text: this.translate.instant('alert.lbl-no'),
          handler: () => resolveFunction(false)
        },
        {
          text: this.translate.instant('alert.lbl-yes'),
          handler: () => resolveFunction(true)
        }
      ]
    });
    await alert.present();
    return promise;
  }
}
