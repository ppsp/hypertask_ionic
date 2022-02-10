import { AfterViewInit, Component, OnInit } from '@angular/core';
//import { FirebaseUISignInSuccessWithAuthResult, FirebaseUISignInFailure } from 'firebaseui-angular';
import { Router } from '@angular/router';
import { IAuthenticationService } from 'src/app/interfaces/i-authentication-service';
import { Language } from 'src/app/models/Core/language.enum';
import { TranslateService } from '@ngx-translate/core';
import { ILogger } from 'src/app/interfaces/i-logger';
import { IUserService } from 'src/app/interfaces/i-user-service';
import { UserConfig } from 'src/app/models/Core/user-config';
import { User } from 'src/app/models/Core/user';
import { MenuController } from '@ionic/angular';
import { UserService } from 'src/app/services/user.service';
import { DataSyncServerService } from 'src/app/services/data-sync-server-service';
import ThreadUtils from 'src/app/shared/thread.utils';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, AfterViewInit {

  public showLogin: boolean;

  constructor(
    private router: Router,
    private auth: IAuthenticationService,
    private userService: IUserService,
    private translate: TranslateService,
    private logger: ILogger,
    private menuCtrl: MenuController) { }

  async ngOnInit() {
    this.menuCtrl.enable(false);
    this.showLogin = true;
    if (this.auth.currentUserIsAuthenticated()) {
      this.redirectToTaskList();
    } else {
      await this.userService.logout();
    }
  }

  async ngAfterViewInit(): Promise<void> {
    // Select first input
    try {
      await ThreadUtils.sleep(500);
      const firstInput: any = document.querySelector('#ui-sign-in-email-input');
      // console.log('firstinput', firstInput);
      firstInput.focus();
    } catch (error) {
      // console.log('error', error);
      this.logger.logError(error);
    }
  }

  /*public successCallback(signInSuccessData: FirebaseUISignInSuccessWithAuthResult): void { // TODO : Capacitor
    this.menuCtrl.enable(true);
    this.logger.logDebug('~ Success Signin Callback', JSON.stringify(signInSuccessData), new Date().toISOString());
    this.showLogin = false;
    this.auth.setLoginPersistance();
    this.logger.logDebug('~ Login persistance set', new Date().toISOString());
    this.userService.getUserForLogin().then(user => {
      this.logger.logDebug('~ Got Current User, setting language', new Date().toISOString());

      if (user == null) {
        this.logger.logDebug('user is null, redirecting to tasklist for FirstTime()');
        this.redirectToTaskList();
        return;
      }

      UserService.currentUser = user;
      UserService.currentUserId = user.UserId;
      DataSyncServerService.GetLatestRequired = true;
      DataSyncServerService.GetLatestRequiredReason = 'Login success';
      // console.log('got user', user);
      if (User.getConfig(user, UserConfig.PreferedLanguageKey) === Language.French) {
        this.logger.logDebug('~ Use Fr', new Date().toISOString());
        this.translate.use('fr');
        this.logger.logDebug('~ Fr Used', new Date().toISOString());
      } else {
        this.logger.logDebug('~ Use En', new Date().toISOString());
        this.translate.use('en');
        this.logger.logDebug('~ En Used', new Date().toISOString());
      }
      if (User.getConfig(user, UserConfig.KeepPortrait) === true) {
        try {
          screen.orientation.lock('portrait');
        } catch (error) {

        }
      }
      this.redirectToTaskList();
    }).catch(error => {
      // console.log('Error get user for login', error);
      alert('Unable to get user from server, please try again later');
      this.redirectToLogin();
    });
  }*/

  /*public errorCallback(errorData: FirebaseUISignInFailure): void {
    this.logger.logEvent('login failed', { key: 'errorDate', value: JSON.stringify(errorData) });
  }*/

  private redirectToTaskList(): void {
    this.logger.logDebug('~ Redirecting to task list', new Date().toISOString());
    this.router.navigate(['/task-list']);
  }

  private async redirectToLogin(): Promise<void> {
    this.logger.logDebug('~ Redirecting to login', new Date().toISOString());
    await this.userService.logout();
    location.reload();
  }
}
