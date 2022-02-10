/*import { CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef, Injector, APP_INITIALIZER } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService, TranslatePipe, TranslateModule } from '@ngx-translate/core';
import { TranslatePipeMock } from 'src/app/tests/mocks/translate-mock.service';
import { FormatDayOfWeekAbbrPipe } from 'src/app/pipes/format-dayofweek-abbr-pipe';
import { MainPipeModule } from 'src/app/pipes/main-pipe.module';
import { IAuthenticationService } from 'src/app/interfaces/i-authentication-service';
import { CalendarTaskService } from 'src/app/services/calendar-task.service';
import { ModalController, Platform, AlertController, AngularDelegate } from '@ionic/angular';
import { IUserService } from 'src/app/interfaces/i-user-service';
import { UserMockService } from 'src/app/tests/mocks/user-mock.service';
import { DateService } from 'src/app/services/date.service';
import { DatePipe, LOCATION_INITIALIZED } from '@angular/common';
import { MockApiProvider } from 'src/app/tests/mocks/api-provider-mock';
import { IApiProvider } from 'src/app/interfaces/i-api-provider';
import { AuthenticationMockService } from 'src/app/tests/mocks/authentication-mock.service';
import { ILocalStorageService } from 'src/app/interfaces/i-local-storage-service';
import { LocalStorageMockService } from 'src/app/tests/mocks/local-storage-mock.service';
import { ILogger } from 'src/app/interfaces/i-logger';
import { MockLogger } from 'src/app/tests/mocks/logger-mock.service';
import { IDataSyncLocalService } from 'src/app/interfaces/i-data-sync-local-service';
import { DataSyncLocalService } from 'src/app/services/data-sync-local-service';
import { CalendarTask } from 'src/app/models/Core/calendar-task';
import { ResultType } from 'src/app/models/Core/result-type.enum';
import { TaskFrequency } from 'src/app/models/Core/task-frequency.enum';
import { TaskCardComponent } from './task-card.component';

describe('TaskCardComponent', () => {
  let component: TaskCardComponent;
  let fixture: ComponentFixture<TaskCardComponent>;

  beforeAll(async () => {
    TestBed.configureTestingModule({
      // modules
      imports: [
        MainPipeModule,
        TranslateModule.forRoot(),
      ],
      // declarations: [ TaskEditComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      // services
      providers: [
        {
          provide: APP_INITIALIZER,
          useFactory: appInitializerFactory,
          deps: [TranslateService, Injector],
          multi: true
        },
        { provide: TranslatePipe, useClass: TranslatePipeMock },
        { provide: FormatDayOfWeekAbbrPipe, useClass: FormatDayOfWeekAbbrPipe },
        { provide: IAuthenticationService, useClass: AuthenticationMockService },
        { provide: ILocalStorageService, useClass: LocalStorageMockService },
        { provide: IUserService, useClass: UserMockService },
        { provide: IApiProvider, useClass: MockApiProvider },
        { provide: ILogger, useClass: MockLogger },
        { provide: IDataSyncLocalService, useClass: DataSyncLocalService },
        CalendarTaskService,
        Platform,
        ChangeDetectorRef,
        DateService,
        AlertController,
        DatePipe,
        AngularDelegate,
        ModalController,
      ],
      declarations : [TaskCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskCardComponent);
    component = fixture.componentInstance;
    component.currentTask = getTestTask(getRandomId());
    component.ngOnInit();
    fixture.detectChanges();
  });

  it('should create', async () => {
    console.log('component', component);
    // expect(component.).toBe(ResultType.Binary.toString());
  });

  // TODO : Extract this
  function getTestTask(taskId: string) {
    const calendarTask = new CalendarTask();
    calendarTask.Name = 'Test Task 1';
    calendarTask.ResultType = ResultType.Binary;
    calendarTask.Frequency = TaskFrequency.Daily;
    calendarTask.UserId = 'TestUserId';
    calendarTask.CalendarTaskId = taskId;
    return calendarTask;
  }

  function getRandomId(): string {
    return makeid(20);
  }

  function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  function getRandomName(): string {
    return makeid(20);
  }
});

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

*/
