import { APP_INITIALIZER, Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { SideMenuComponent } from './components/side-menu/side-menu.component';
import { TaskListComponent } from './components/task-list/task-list.component';
import { PrivacyComponent } from './components/privacy/privacy.component';
import { TermsComponent } from './components/terms/terms.component';
import { LoginComponent } from './components/login/login.component';
import { TaskCardComponent } from './components/TaskCard/task-card/task-card.component';
import { TaskSelectionComponent } from './components/task-selection/task-selection.component';
import { TaskSelectionCardComponent } from './components/task-selection-card/task-selection-card.component';
import { SendFeedbackComponent } from './components/send-feedback/send-feedback.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { TaskCardPopoverComponent } from './components/TaskCard/task-card-popover/task-card-popover.component';
import { UserSettingsComponent } from './components/user-settings/user-settings.component';
import { GroupCardComponent } from './components/group-card/group-card.component';
import { GroupPopoverComponent } from './components/group-popover/group-popover.component';
import { DebugLogComponent } from './components/debug-log/debug-log.component';
import { GroupListComponent } from './components/group-list/group-list.component';
import { SkipsPopoverComponent } from './components/skips-popover/skips-popover.component';
import { ILogger } from './interfaces/i-logger';
import { IAuthenticationService } from './interfaces/i-authentication-service';
import { AuthenticationService } from './services/authentication.service';
import { DataSyncServerService } from './services/data-sync-server-service';
import { DataSyncService } from './services/data-sync.service';
import { ILocalStorageService } from './interfaces/i-local-storage-service';
import { IDataSyncLocalService } from './interfaces/i-data-sync-local-service';
import { DataSyncLocalService } from './services/data-sync-local-service';
import { IApiProvider } from './interfaces/i-api-provider';
import { ChangelogService } from './services/changelog.service';
import { NetworkService } from './services/network.service';
import { AlertService } from './services/alert.service';
import { TaskStatsService } from './services/task-stats.service';
import { EventService } from './services/event.service';
import { BugReportService } from './services/bug-report.service';
import { FireworksService } from './services/fireworks.service';
import { ReportService } from './services/report.service';
import { IUserService } from './interfaces/i-user-service';
import { UserService } from './services/user.service';
import { DatePipe, LOCATION_INITIALIZED } from '@angular/common';
import { FormatDayOfWeekPipe } from './pipes/format-dayofweek-pipe';
import { FormatDayOfWeekAbbrPipe } from './pipes/format-dayofweek-abbr-pipe';
import { AppUpdate } from '@ionic-native/app-update/ngx';
import { SelectableTaskService } from './services/selectable-task.service';
import { DateService } from './services/date.service';
import { ModalService } from './services/modal.service';
import { TimerService } from './services/timer.service';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { MainPipeModule } from './pipes/main-pipe.module';
import { Ionic4DatepickerModule } from '@logisticinfotech/ionic4-datepicker';
import { ApiService } from './services/api-service';
import { SqliteService } from './services/sqlite.service';
import { SQLite } from '@ionic-native/sqlite/ngx';
import { IonicStorageModule } from '@ionic/storage-angular';
import { LocalStorageMockService } from './tests/mocks/local-storage-mock.service';
import { MockLogger } from './tests/mocks/logger-mock.service';
import { File } from '@ionic-native/file/ngx';
import 'firebaseui/dist/firebaseui.css'
import { environment } from 'src/environments/environment';
import { FormsModule } from '@angular/forms';
import { firebase, firebaseui, FirebaseUIModule } from 'firebaseui-angular';
import { AngularFireModule } from "@angular/fire/compat";
import { AngularFireAuthModule, USE_EMULATOR as USE_AUTH_EMULATOR } from "@angular/fire/compat/auth";
import { LocalStorageService } from './services/local-storage.service';
import { Drivers } from '@ionic/storage';
import { TimerComponent } from './components/TaskCard/timer/timer.component';
import { TaskScoresComponent } from './components/TaskCard/task-scores/task-scores.component';
import { TaskCreateComponent } from './components/task-create/task-create.component';

//import { SplashScreen } from '@ionic-native/splash-screen/ngx';
//import { AppVersion } from '@ionic-native/app-version/ngx';
//import { BackgroundMode } from '@ionic-native/background-mode/ngx';
//import { Network } from '@ionic-native/network/ngx';
//import { AppMinimize } from '@ionic-native/app-minimize/ngx';

// AoT requires an exported function for factories
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

const firebaseUiAuthConfig: firebaseui.auth.Config = {
  signInOptions: [
    // EMAIL
    {
      requireDisplayName: false,
      provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
    }
  ],
  tosUrl: '/terms',
  privacyPolicyUrl: '/privacy',
  credentialHelper: firebaseui.auth.CredentialHelper.NONE,
};

export function appInitializerFactory(translate: TranslateService, injector: Injector) {
  return () => new Promise<any>((resolve: any) => {
    const locationInitialized = injector.get(LOCATION_INITIALIZED, Promise.resolve(null));
    locationInitialized.then(() => {
      const langToSet = 'en'; // TODO : Use user language
      translate.setDefaultLang(langToSet);
      translate.use(langToSet).subscribe(() => {
      }, err => {
        console.error(`Problem with '${langToSet}' language initialization.'`);
      }, () => {
        resolve(null);
      });
    });
  });
}

@NgModule({
  declarations: [
    AppComponent,
    TaskListComponent,
    PrivacyComponent,
    TermsComponent,
    LoginComponent,
    TaskCardComponent,
    TaskListComponent,
    TaskCardComponent,
    SideMenuComponent,
    TaskCardComponent,
    TermsComponent,
    TaskSelectionComponent,
    TaskSelectionCardComponent,
    SendFeedbackComponent,
    WelcomeComponent,
    TaskCardPopoverComponent,
    SkipsPopoverComponent,
    UserSettingsComponent,
    GroupCardComponent,
    GroupPopoverComponent,
    DebugLogComponent,
    TaskListComponent,
    GroupListComponent,
    GroupCardComponent,
    GroupListComponent,
    TaskCardPopoverComponent,
    TimerComponent,
    TaskCreateComponent,
    TaskScoresComponent,
  ],
  entryComponents: [],
  imports: [
    BrowserModule, 
    IonicModule.forRoot(), 
    AppRoutingModule,
    HttpClientModule,
    MainPipeModule,
    Ionic4DatepickerModule,
    IonicStorageModule.forRoot({
        name: 'tasksDb',
        driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage]
    }),
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    FirebaseUIModule.forRoot(firebaseUiAuthConfig),
    TranslateModule.forRoot({
      loader: {
          provide: TranslateLoader,
          useFactory: (createTranslateLoader),
          deps: [HttpClient],
      },
  }),
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    //StatusBar, TODO CAPACITOR
    //SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    //{ provide: ILogger, useClass: ApplicationInsightsService },
    { provide: ILogger, useClass: MockLogger },
    { provide: IAuthenticationService, useClass: AuthenticationService },
    DataSyncServerService,
    DataSyncService,
    { provide: ILocalStorageService, useClass: LocalStorageService },
    //{ provide: ILocalStorageService, useClass: SqliteService },
    { provide: IDataSyncLocalService, useClass: DataSyncLocalService },
    { provide: IApiProvider, useClass: ApiService },
    //AppMinimize, TODO CAPACITOR
    ChangelogService,
    NetworkService,
    AlertService,
    TaskStatsService,
    SqliteService,
    SQLite,
    File,
    EventService,
    BugReportService,
    FireworksService,
    ReportService,
    { provide: IUserService, useClass: UserService },
    //Network,
    DatePipe,
    FormatDayOfWeekPipe,
    FormatDayOfWeekAbbrPipe,
    //BackgroundMode,
    AppUpdate,
    //Vibration,
    //AppVersion,
    SelectableTaskService,
    DateService,
    //LocalNotifications,
    //NotificationService,
    //VibrationService, TODO CAPACITOR
    //Storage,
    ModalService,
    TimerService,
    {
        provide: APP_INITIALIZER,
        useFactory: appInitializerFactory,
        deps: [TranslateService, Injector],
        multi: true
    },
    //Auth
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
