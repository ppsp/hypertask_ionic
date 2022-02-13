import { Injectable } from '@angular/core';
import { IApiProvider } from 'src/app/interfaces/i-api-provider';
import { DTOCalendarTask } from 'src/app/models/DTO/dto-calendar-task';
import { DTOTaskHistory } from 'src/app/models/DTO/dto-task-history';
import { DTOGetCalendarTaskRequest } from 'src/app/models/DTO/dto-get-calendar-task-request';
import { DTOBugReport } from 'src/app/models/DTO/dto-bug-report';
import NumberUtils from 'src/app/shared/number-utils';
import { DTOUser } from 'src/app/models/DTO/dto-user';
import { DTOTaskGroup } from 'src/app/models/DTO/dto-task-group';

@Injectable()
export class MockApiProvider implements IApiProvider {

  async insertCalendarTasks(tasks: DTOCalendarTask[]): Promise<string[]> {
    const result: string[] = [];
    tasks.forEach(() => result.push(NumberUtils.getRandomId()));
    return result;
  }

  async updateCalendarTasks(tasks: DTOCalendarTask[]): Promise<boolean> {
    return true;
  }

  async getTasks(request: DTOGetCalendarTaskRequest): Promise<DTOCalendarTask[]> {
    const result: DTOCalendarTask[] = [];
    return result;
  }

  async insertTaskHistories(histories: DTOTaskHistory[]): Promise<string[]> {
    const result: string[] = [];
    histories.forEach(() => result.push(NumberUtils.getRandomId()));
    return result;
  }

  async updateTaskHistories(histories: DTOTaskHistory[]): Promise<boolean> {
    return true;
  }

  async sendReport(report: DTOBugReport): Promise<boolean> {
    return true;
  }

  async getUser(userId: string): Promise<DTOUser> {
    return new DTOUser();
  }

  async saveUser(user: DTOUser): Promise<boolean> {
    return true;
  }

  async getGroups(userId: string): Promise<DTOTaskGroup[]> {
    return [];
  }

  async insertGroup(group: DTOTaskGroup): Promise<boolean> {
    return true;
  }

  async updateGroup(group: DTOTaskGroup): Promise<boolean> {
    return true;
  }

  async downloadAllData(userId: string): Promise<string> {
    throw new Error('Method not implemented.');
  }

  async permanentlyDeleteAccount(userId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}
