import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Language } from 'src/app/models/Core/language.enum';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, ModalController, Platform, PickerController, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { IUserService } from 'src/app/interfaces/i-user-service';
import { UserConfig } from 'src/app/models/Core/user-config';
import { User } from 'src/app/models/Core/user';
//import { NotificationService } from 'src/app/services/notification.service';
import { ModalService } from 'src/app/services/modal.service';
import { ReportService } from 'src/app/services/report.service';
import { AlertService } from 'src/app/services/alert.service';
import { AlertOptions } from '@ionic/core';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss'],
})
export class UserSettingsComponent implements OnInit, AfterViewInit, OnDestroy {

  private hourChoices: string[] = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11',
                                   '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];

  public NoSyncValue: string = 'NoSync';
  public SyncValue: string = 'Sync';
  public keepPortraitEnabled: boolean = false;

  public currentLanguage: Language = Language.English;
  public endOfDayTime: string;
  public incompleteTime: string;
  public autoSkipEnabled: boolean;
  public inactivityTime: string;
  private backButtonSubscription: Subscription;
  public currentCloudSyncEnabled: boolean;
  public syncCurrentValue: string;

  constructor(private userService: IUserService,
              private translate: TranslateService,
              private alertCtrl: AlertController,
              private modalController: ModalController,
              private platform: Platform,
              private pickerCtrl: PickerController,
              //private notificationService: NotificationService, TODO CAPACITOR
              private loading: LoadingController,
              private reportService: ReportService,
              private alertService: AlertService) { }

  ngOnInit() {
    this.resetBackButton();
  }

  ngOnDestroy() {
    this.backButtonSubscription.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.userService.getCurrentUser().then(user => {
      // console.log('[1]ngAfterViewInit user', user);

      if (User.getConfig(user, UserConfig.PreferedLanguageKey) === Language.French) {
        this.currentLanguage = Language.French;
      } else {
        this.currentLanguage = Language.English;
      }

      if (User.getConfig(user, UserConfig.EndOfDayTimeKey) == null ||
          User.getConfig(user, UserConfig.EndOfDayTimeKey).length === 0) {
        this.endOfDayTime = '04:00';
      } else {
        this.endOfDayTime = User.getConfig(user, UserConfig.EndOfDayTimeKey);
      }

      // console.log('ENABLE3');
      if (User.getConfig(user, UserConfig.EnableCloudSyncKey) === true) {
        this.syncCurrentValue = this.SyncValue;
        this.currentCloudSyncEnabled = true;
      } else {
        this.syncCurrentValue = this.NoSyncValue;
        this.currentCloudSyncEnabled = false;
      }

      if (User.getConfig(user, UserConfig.AutoSkipAfter2DaysId) === true) {
        this.autoSkipEnabled = true;
      } else {
        this.autoSkipEnabled = false;
      }

      if (User.getConfig(user, UserConfig.KeepPortrait) === true) {
        this.keepPortraitEnabled = true;
      } else {
        this.keepPortraitEnabled = false;
      }
    });
  }

  public async btnHelpClick(): Promise<void> {
    const alert = await this.alertCtrl.create({
      message: this.translate.instant('menu.end-of-day-help'),
    });

    await alert.present();

    this.setBackButtonAlert(alert);
    await alert.onDidDismiss();
    this.resetBackButton();
  }

  public async languageChanged(event: any) {
    await this.userService.setLanguage(event.detail.value);
    //await this.notificationService.resetAllNotifications(); TODO CAPACITOR
  }

  public async autoSkipChanged(event: any) {
    // console.log('AUTO SKIP CHANGED TO ', event.detail.checked);
    User.setConfig(UserService.currentUser, UserConfig.AutoSkipAfter2DaysId, event.detail.checked);
    await this.userService.saveUser(UserService.currentUser);
  }

  public async closePopup(): Promise<void> {
    await this.modalController.dismiss(false, null, ModalService.ModalIds.UserSettings);
  }

  public async privacyChanged(event: any) {
    if (event.detail.value === 'NoSync') {
      this.currentCloudSyncEnabled = false;
      await this.userService.setCloudSync(false);
    } else {
      this.currentCloudSyncEnabled = true;
      await this.userService.setCloudSync(true);
    }
  }

  public async btnDownloadMyDataClick() {
    const loading = await this.loading.create({
      message: this.translate.instant('user-settings.download-data-loading')
    });

    await loading.present();

    await this.reportService.getAllData();

    await loading.dismiss();
  }

  public async btnDeleteMyDataClick() {
    const handler: (alertData: any) => void = (alertData) => {
      this.deleteAccount();
    };

    const alertOptions: AlertOptions = this.alertService.getDeleteAccountAlertOptions(handler);
    const alert = await this.alertCtrl.create(alertOptions);
    await alert.present();

    const subscription = this.platform.backButton.subscribe(async () => {
      await alert.dismiss();
    });

    await alert.onDidDismiss();

    subscription.unsubscribe();
  }

  public async deleteAccount() {
    // console.log('Deleting account');
    const loading = await this.loading.create({message: this.translate.instant('alert.deleting-account')});
    await loading.present();

    const success = await this.userService.permanentlyDeleteAccount();
    await loading.dismiss();

    if (success === true) {
      const alert = await this.alertCtrl.create({message: this.translate.instant('alert.delete-account-success')});
      await alert.present();
      await alert.onDidDismiss();
      await this.userService.logout();
      location.reload();
    } else {
      const alert = await this.alertCtrl.create({message: this.translate.instant('alert.delete-account-failed')});
      await alert.present();
      await alert.onDidDismiss();
      return;
    }
  }

  public async btnEnterTimeClick(): Promise<void> {
    const picker = await this.pickerCtrl.create({
      columns: this.getEndOfDayColumns(),
      cssClass: 'time-picker',
      animated: false,
      buttons: [
        {
          text: this.translate.instant('alert.lbl-cancel'),
          role: 'cancel'
        },
        {
          text: this.translate.instant('alert.lbl-ok'),
          handler: (value) => {
            // console.log('HOUR', value.Hours.value);
            // console.log('MINUTES', value.Minutes.value);

            const hourString = Number(value.Hours.value) > 9 ?
                                 value.Hours.value :
                                 '0' + value.Hours.value;

            const minutesString = Number(value.Minutes.value) > 9 ?
                                 value.Minutes.value :
                                 '0' + value.Minutes.value;

            this.endOfDayTime = hourString + ':' + minutesString;

            // console.log('END OF DAY TIME', this.endOfDayTime);

            this.userService.getCurrentUser().then((user) => {
              if (User.getConfig(user, UserConfig.EndOfDayTimeKey) !== this.endOfDayTime) {
                User.setConfig(user, UserConfig.EndOfDayTimeKey, this.endOfDayTime);
                this.userService.saveUser(user);
              }
            });
          }
        }
      ]
    });

    await picker.present();

    this.setBackButtonPicker(picker);
    await picker.onDidDismiss();
    this.resetBackButton();
  }

  public async keepPortraitChanged(event: any) {
    // console.log('keepverticalchanged Value', event);
    try {
      if (this.platform.is('capacitor')) {
        if (event.detail.checked === true) {
          // set to portrait
          screen.orientation.lock('portrait');
          this.userService.setKeepPortrait(true);
          /*this.currentCloudSyncEnabled = false;
          await this.userService.setCloudSync(false);*/
        } else {
          screen.orientation.unlock();
          this.userService.setKeepPortrait(false);
          /*this.currentCloudSyncEnabled = true;
          await this.userService.setCloudSync(true);*/
        }
      }
    } catch (error) {

    }
  }

  private getColumnOptions1() {
    const options = [];
    for (const hourValue of this.hourChoices) {
      options.push({
        text: hourValue,
        value: Number(hourValue)
      });
    }

    return options;
  }

  private getColumnOptions2() {
    const options = [];
    options.push({
      text: '00',
      value: Number(0)
    });

    return options;
  }

  private getEndOfDayColumns() {
    const currentHour = Number(this.endOfDayTime.substring(0, 2));
    // console.log('CURRENT HOUR', currentHour);
    // const currentMinutes = Number(currentSelection.substring(3, 3 + 2));
    const HourIndex = this.hourChoices.findIndex(p => Number(p) === currentHour);
    // console.log('CURRENT HourIndex', HourIndex, this.hourChoices);

    const MinuteIndex = 0;
    const columns = [];

    columns.push({
      name: 'Hours',
      selectedIndex: HourIndex,
      options: this.getColumnOptions1(),
    });

    columns.push({
      name: 'Minutes',
      selectedIndex: MinuteIndex,
      options: this.getColumnOptions2()
    });

    // console.log('columns');

    return columns;
  }

  private setBackButtonPicker(picker: HTMLIonPickerElement) {
    this.backButtonSubscription.unsubscribe();
    this.backButtonSubscription = this.platform.backButton.subscribe(async () => {
      await picker.dismiss();
    });
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
