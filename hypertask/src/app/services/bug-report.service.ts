import { Injectable } from '@angular/core';
import { DTOBugReport } from '../models/DTO/dto-bug-report';
import { IApiProvider } from '../interfaces/i-api-provider';

@Injectable({
  providedIn: 'root'
})
export class BugReportService {

  constructor(private apiProvider: IApiProvider) { }

  public async SendReport(report: DTOBugReport): Promise<boolean> {
    if (report.Title.length > 200) {
      report.Title = report.Title.substring(0, 200);
    }

    if (report.Description != null && report.Description.length > 20000) {
      report.Description = report.Description.substring(0, 20000);
    }

    const success = await this.apiProvider.sendReport(report);
    return success;
  }
}
