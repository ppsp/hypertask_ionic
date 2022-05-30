import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
//import { SplashScreen } from '@capacitor/splash-screen';
//import { StatusBar, Style } from '@capacitor/status-bar';
import { AppUpdate } from '@ionic-native/app-update/ngx';
import { environment } from 'src/environments/environment';
import { ChangelogService } from './services/changelog.service';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from './services/user.service';
import { Language } from './models/Core/language.enum';
import { ILogger } from './interfaces/i-logger';
import { UserConfig } from './models/Core/user-config';
import { User } from './models/Core/user';
import DateUtils from './shared/date-utils';
import { DataSyncService } from './services/data-sync.service';
import { DataSyncServerService } from './services/data-sync-server-service';
import { DataSyncService2 } from './services/data-sync-2.service';
// import * as introJs from 'intro.js/intro.js';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private appUpdate: AppUpdate,
    private changeLogService: ChangelogService,
    private dataSync: DataSyncService,
    private dataSync2: DataSyncService2,
    private translate: TranslateService,
    private userService: UserService,
    private logger: ILogger) {
    this.initializeApp();
  }

  initializeApp() {
    const dateStart = new Date();
    this.logger.logDebug('INITIALIZE APP', dateStart.toISOString());
    this.platform.ready().then(() => {
      // this.logger.logDebug('Platform ready ', DateUtils.getTimeSince(dateStart));
      //SplashScreen.hide()
      //StatusBar.setStyle() // TODO : CAPACITOR
      //this.statusBar.styleLightContent();
      //this.splashScreen.hide();
      DataSyncServerService.GetLatestRequired = true;
      DataSyncServerService.GetLatestRequiredReason = 'Initialize App';
      // this.dataSync.checkForSyncRepeat();
      this.dataSync2.checkForSyncRepeat();

      // this.logger.logDebug('GET User Initial ', DateUtils.getTimeSince(dateStart));

      this.userService.getCurrentUser().then(user => {
        if (user != null) {
          this.logger.logDebug('GOT User Initial', DateUtils.getTimeSince(dateStart));

          this.logger.logEvent('got user initial', {
            key: 'user', value: JSON.stringify(user)
          });
          this.translate.use(User.getConfig(user, UserConfig.PreferedLanguageKey) === Language.English ?
            'en' :
            'fr').toPromise().then(() => {
            // this.logger.logDebug('Checking for update', DateUtils.getTimeSince(dateStart));
            this.checkForUpdateCordova();
            // this.logger.logDebug('Checked for update', DateUtils.getTimeSince(dateStart));
          });
          if (User.getConfig(user, UserConfig.KeepPortrait) === true) {
            try {
              if (this.platform.is('capacitor')) {
                screen.orientation.lock('portrait');
              }
            } catch (error) {

            }
          }
        } else {
          this.translate.use('en').toPromise().then(() => {
            this.checkForUpdateCordova();
          });
        }
      });
    });
  }

  private checkForUpdateCordova() {
    if (this.platform.is('cordova')) {
      this.checkForUpdate();
      this.changeLogService.showChangeLogsAndSetToViewed();
      /*this.platform.backButton.subscribeWithPriority(0, () => {
        this.logger.logEvent('minimizing app', {
          key: 'user', value: JSON.stringify(user)
        });
        this.appMinimize.minimize();
      });*/
    }
  }

  public async checkForUpdate(): Promise<void> {
    try {
      const updateUrl = environment.apiUpdateXmlUrl;
      await this.appUpdate.checkAppUpdate(updateUrl);
    } catch (error) {
      this.logger.logError(error);
      // console.log('error checking for update', error);
      // alert(this.translate.instant('login.msg-update-error') + error.msg);
    }
  }
}
