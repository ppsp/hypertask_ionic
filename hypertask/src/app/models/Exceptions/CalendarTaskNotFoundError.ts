export class CalendarTaskNotFoundError extends Error {

  httpStatus?: number = 404;
  applicationStatus?: number;
  errorMessageTranslationkey: string;
  handled: boolean = false;

  constructor(message?: string) {
    super(message);
    this.name = CalendarTaskNotFoundError.name;
    Object.setPrototypeOf(this, CalendarTaskNotFoundError.prototype);
  }
}
