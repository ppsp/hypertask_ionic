import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Language } from 'src/app/models/Core/language.enum';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ModalController, AlertController, PickerController, Platform } from '@ionic/angular';
import { IUserService } from 'src/app/interfaces/i-user-service';
import { UserConfig } from 'src/app/models/Core/user-config';
import { User } from 'src/app/models/Core/user';
import { TranslateService } from '@ngx-translate/core';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
})
export class WelcomeComponent implements OnInit, AfterViewInit {

  private hourChoices: string[] = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11',
                                   '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];

  public NoSyncValue: string = 'NoSync';
  public SyncValue: string = 'Sync';

  public currentCloudSyncEnabled: boolean;
  public currentLanguage: Language = Language.English;
  public syncCurrentValue: string;
  public endOfDayTime: string;

  constructor(private userService: IUserService,
              private modalController: ModalController,
              private auth: AuthenticationService,
              private translate: TranslateService,
              private alertCtrl: AlertController,
              private pickerCtrl: PickerController,
              private platform: Platform) { }

  ngOnInit() {

  }

  async ngAfterViewInit(): Promise<void> {
    const fireUser = await this.auth.getUser();
    const user = await this.userService.getUser(fireUser.uid);
    if (User.getConfig(user, UserConfig.PreferedLanguageKey) === Language.French) {
      this.currentLanguage = Language.French;
    } else {
      this.currentLanguage = Language.English;
    }

    // this.syncCurrentValue = this.NoSyncValue; // No default value

    if (User.getConfig(user, UserConfig.EndOfDayTimeKey) == null ||
        User.getConfig(user, UserConfig.EndOfDayTimeKey).length === 0) {
      this.endOfDayTime = '04:00';
    } else {
      this.endOfDayTime = User.getConfig(user, UserConfig.EndOfDayTimeKey);
    }
  }

  public async btnNextClick() {
    // Validation
    if (this.syncCurrentValue == null) {
      alert(this.translate.instant('welcome.msg-privacy-mandatory'));
      return;
    }

    await this.modalController.dismiss(null, null, ModalService.ModalIds.Welcome);
  }

  public async languageChanged(event: any) {
    await this.userService.setLanguage(event.detail.value);
  }

  public async privacyChanged(event: any) {
    if (event.detail.value === 'NoSync') {
      this.currentCloudSyncEnabled = false;
      await this.userService.setCloudSync(false);
    } else {
      this.currentCloudSyncEnabled = false;
      await this.userService.setCloudSync(true);
    }
  }

  public async btnHelpClick(): Promise<void> {
    const alert = await this.alertCtrl.create({
      message: this.translate.instant('menu.end-of-day-help'),
    });

    await alert.present();

    const subscription = this.platform.backButton.subscribe(async () => {
      await alert.dismiss();
    });
    await alert.onDidDismiss();
    subscription.unsubscribe();
  }
}
