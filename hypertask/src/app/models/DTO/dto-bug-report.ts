import { BugReportType } from '../Core/bug-report-type.enum';

export class DTOBugReport {
  Title: string;
  UserId: string;
  Description: string;
  InsertDate: Date;
  BugReportType: BugReportType;
}
