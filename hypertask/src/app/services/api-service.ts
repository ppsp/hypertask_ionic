import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { DTOGetCalendarTaskRequest } from '../models/DTO/dto-get-calendar-task-request';
import { DTOCalendarTask } from '../models/DTO/dto-calendar-task';
import { DTOTaskHistory } from '../models/DTO/dto-task-history';
import { forkJoin, throwError } from 'rxjs';
import { DTOBugReport } from '../models/DTO/dto-bug-report';
import { IApiProvider as IApiService } from '../interfaces/i-api-provider';
import { ILogger } from '../interfaces/i-logger';
import { DTOUser } from '../models/DTO/dto-user';
import { DTOUserConfig } from '../models/DTO/dto-user-config';
//import DateUtils from '../shared/date-utils';
import { DTOTaskGroup } from '../models/DTO/dto-task-group';
import { File } from '@ionic-native/file/ngx';
import { ApiHttpError } from '../models/Exceptions/ApiHttpError';
import { IAuthenticationService } from '../interfaces/i-authentication-service';

@Injectable({
  providedIn: 'root'
})
export class ApiService implements IApiService {

  private baseUrl: string = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private logger: ILogger,
    private file: File,
    private auth: IAuthenticationService) { }

  public async getHttpHeaders(): Promise<HttpHeaders> {
    const token = await this.auth.getUserJsonWebToken();
    return new HttpHeaders().set('Authorization', token);
  }

  /*
   * Build the api url call with the provided method name
   */
  private getApiUrlCall(methodName: string): string {
    let url = '';

    url = this.baseUrl + methodName;

    return url;
  }

  public async insertCalendarTasks(tasks: DTOCalendarTask[]): Promise<string[]> {
    const url = this.getApiUrlCall('api/CalendarTask');
    const headers = await this.getHttpHeaders();

    try {
      // We can't send all requests at the same time because we need to keep track of the Ids
      // this could be solved by assinging a second Id to be able to reorder them after received
      const calendarTaskIds: string[] = [];
      for (const task of tasks) {
        const dto = task.clone();
        dto.Histories = [];
        // console.log('insertCalendarTasks', task);
        const calendarTaskId = await this.http.post<string>(url, dto, { headers }).toPromise();
        calendarTaskIds.push(calendarTaskId);
      }

      return calendarTaskIds;
    } catch (error) {
      this.logger.logError(new Error('insertCalendarTasks failed'), { key: 'error', value: JSON.stringify(error)});
      throwError('insertCalendarTasks failed');
    }
  }

  public async updateCalendarTasks(tasks: DTOCalendarTask[]): Promise<boolean> {
    const url = this.getApiUrlCall('api/CalendarTask');
    const headers = await this.getHttpHeaders();

    try {
      const observables = [];
      for (const task of tasks) {
        const dto = task.clone();
        dto.Histories = [];
        const oneObs = this.http.put<boolean>(url, dto, { headers });
        observables.push(oneObs);
      }

      // console.log('updateCalendarTasks', tasks);

      await forkJoin(observables).toPromise();
      return true;
    } catch (error) {
      this.logger.logError(new Error('updateCalendarTasks failed'), { key: 'error', value: JSON.stringify(error)});
      throwError('updateCalendarTasks failed');
    }
  }

  public async getTasks(request: DTOGetCalendarTaskRequest): Promise<DTOCalendarTask[]> {
    const url = this.getApiUrlCall('api/CalendarTask');
    const headers = await this.getHttpHeaders();

    let params = new HttpParams();
    params = params.append('userId', request.userId);
    params = params.append('IncludeVoid', String(request.IncludeVoid));
    params = params.append('DateStart', request.DateStart.toISOString());
    params = params.append('DateEnd', request.DateEnd.toISOString());

    try {
      const response = await this.http.get<DTOCalendarTask[]>(url, { params, headers }).toPromise();
      return response;
    } catch (error) {
      // console.log('error', error);
      this.logger.logError(new Error('getTasks failed'), { key: 'error', value: JSON.stringify(error)});
      // throwError('getTasks failed').toPromise();
      return [];
    }
  }

  public async insertTaskHistories(histories: DTOTaskHistory[]): Promise<string[]> {

    //console.log('inserting taskhistories', histories);
    const url = this.getApiUrlCall('api/TaskHistory');
    const headers = await this.getHttpHeaders();

    try {
      // We can't send all requests at the same time because we need to keep track of the Ids
      // this could be solved by assinging a second Id to be able to reorder them after received
      const historyIds: string[] = [];
      for (const history of histories) {
        const historyId = await this.http.post<string>(url, history, { headers }).toPromise();
        historyIds.push(historyId);
      }

      return historyIds;
    } catch (error) {
      this.logger.logError(new Error('insertTaskHistories failed'), { key: 'error', value: JSON.stringify(error)});

      if (error.name === 'HttpErrorResponse') {
        throw new ApiHttpError('Unable to get user from api');
      }

      throwError('insertTaskHistories failed');
    }
  }

  public async updateTaskHistories(histories: DTOTaskHistory[]): Promise<boolean> {
    const url = this.getApiUrlCall('api/TaskHistory');
    const headers = await this.getHttpHeaders();

    try {
      const observables = [];
      for (const history of histories) {
        const oneObs = this.http.put<boolean>(url, history, { headers });
        observables.push(oneObs);
      }

      await forkJoin(observables).toPromise();
      return true;
    } catch (error) {
      this.logger.logError(new Error('updateTaskHistories failed'), { key: 'error', value: JSON.stringify(error)});
      throwError('updateTaskHistories failed');
    }
  }

  public async sendReport(report: DTOBugReport): Promise<boolean> {
    const url = this.getApiUrlCall('api/BugReport');
    const headers = await this.getHttpHeaders();

    try {
      const result = await this.http.post<boolean>(url, report, { headers }).toPromise();

      return result;
    } catch (error) {
      this.logger.logError(new Error('sendReport failed'), { key: 'error', value: JSON.stringify(error)});
      throwError('sendReport failed');
    }
  }

  public async getUser(userId: string): Promise<DTOUser> {
    const start = new Date();
    // this.logger.logDebug('GETUSER', userId, start.toISOString());
    const url = this.getApiUrlCall('api/User');
    const headers = await this.getHttpHeaders();

    let params = new HttpParams();
    params = params.append('userId', userId);

    try {
      const response = await this.http.get<DTOUser>(url, { params, headers }).toPromise();
      if (response == null) {
        return null;
      }

      // NULL User behavior from api
      if (response.Id === null && response.UserId === null) {
        return null;
      }

      // this.logger.logDebug('GETUSER response', JSON.stringify(response), DateUtils.getTimeSince(start));

      if (response.Config == null) {
        response.Config = new DTOUserConfig();
      }
      return response;
    } catch (error) {
      // console.log('ERROR GET USER: ', error);
      if (error.name === 'HttpErrorResponse') {
        throw new ApiHttpError('Unable to get user from api');
      }

      this.logger.logError(new Error('getUser failed'), { key: 'error', value: JSON.stringify(error)});
      throwError('getUser failed').toPromise();
    }
  }

  public async saveUser(user: DTOUser): Promise<boolean> {
    const url = this.getApiUrlCall('api/User');
    const headers = await this.getHttpHeaders();

    try {
      // console.log('API SAVE USER', user, new Date());
      const response = await this.http.put<any>(url, user, { headers }).toPromise();
      // console.log('API USER SAVED', new Date());
      return response;
    } catch (error) {
      this.logger.logError(new Error('setUser failed'), { key: 'error', value: JSON.stringify(error)});
      throwError('setUser failed').toPromise();
    }
  }

  public async getGroups(userId: string): Promise<DTOTaskGroup[]> {
    const url = this.getApiUrlCall('api/TaskGroup');
    const headers = await this.getHttpHeaders();

    let params = new HttpParams();
    params = params.append('userId', userId);

    try {
      const response = await this.http.get<DTOTaskGroup[]>(url, { params, headers }).toPromise();
      if (response == null) {
        return null;
      }

      // this.logger.logDebug('getGroups response', JSON.stringify(response));

      return response;
    } catch (error) {
      this.logger.logError(new Error('getGroups failed'), { key: 'error', value: JSON.stringify(error)});
      throwError('getGroups failed').toPromise();
    }
  }

  public async insertGroup(group: DTOTaskGroup): Promise<boolean> {
    const url = this.getApiUrlCall('api/TaskGroup');
    const headers = await this.getHttpHeaders();

    try {
      const groupId = await this.http.post<string>(url, group, { headers }).toPromise();

      return true;
    } catch (error) {
      this.logger.logError(new Error('insertGroup failed'), { key: 'error', value: JSON.stringify(error)});
      throwError('insertGroup failed');
    }
  }

  public async updateGroup(group: DTOTaskGroup): Promise<boolean> {
    const url = this.getApiUrlCall('api/TaskGroup');
    const headers = await this.getHttpHeaders();

    console.log('UPDATING GROUP API : ', group);

    try {
      const groupId = await this.http.put<string>(url, group, { headers }).toPromise();

      return true;
    } catch (error) {
      this.logger.logError(new Error('insertGroup failed'), { key: 'error', value: JSON.stringify(error)});
      throwError('insertGroup failed');
    }
  }

  public async downloadAllData(userId: string): Promise<string> {
    const url = this.getApiUrlCall('api/Report');
    const headers = await this.getHttpHeaders();

    let params = new HttpParams();
    params = params.append('userId', userId);

    try {
      const response = await this.http.get<any>(url, { params, headers, responseType: 'blob' as 'json' }).toPromise();
      // console.log('DONWLOAD RESPONSE : ', response);
      if (response == null) {
        return null;
      }

      // this.logger.logDebug('getreport response', JSON.stringify(response));

      // For other browsers:
      // Create a link pointing to the ObjectURL containing the blob.
      // const data = window.URL.createObjectURL(response);
      /*const link = document.createElement('a');
      link.href = data;
      link.download = 'hypertaskdata.csv';
      link.click();
      setTimeout(() => {
        // For Firefox it is necessary to delay revoking the ObjectURL
        window.URL.revokeObjectURL(data);
      }, 100);*/

      // SAVE DOWNLOADED FILE
      const result = await this.file.writeFile(this.file.externalRootDirectory + '/Download',
                                               'hypertaskdata.csv',
                                               response,
                                               {replace: true});

      // console.log('result:', result.nativeURL);

      return result.nativeURL;
    } catch (error) {
      // console.log('DOWNLOAD ERROR : ', error);
      this.logger.logError(new Error('downloadAllData failed'), { key: 'error', value: JSON.stringify(error)});
      throwError('downloadAllData failed').toPromise();
    }
  }

  public async permanentlyDeleteAccount(userId: string): Promise<boolean> {
    const url = this.getApiUrlCall('api/User');
    const headers = await this.getHttpHeaders();

    let params = new HttpParams();
    params = params.append('userId', userId);

    try {
      const response = await this.http.delete<any>(url, { params, headers }).toPromise();
      // console.log('DELETE RESPONSE : ', response);
      if (response == null) {
        return null;
      }

      // this.logger.logDebug('getreport response', JSON.stringify(response));

      return true;
    } catch (error) {
      // console.log('DELETE ERROR : ', error);
      this.logger.logError(new Error('delete account failed'), { key: 'error', value: JSON.stringify(error)});
      throwError('delete account failed').toPromise();
    }
  }
}
