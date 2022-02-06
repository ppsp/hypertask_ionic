export class TaskHistoryAlreadyExistsError extends Error {

  httpStatus?: number = 404;
  applicationStatus?: number;
  errorMessageTranslationkey: string;
  handled: boolean = false;

  constructor(message?: string) {
    super(message);
    this.name = TaskHistoryAlreadyExistsError.name;
    Object.setPrototypeOf(this, TaskHistoryAlreadyExistsError.prototype);
  }
}
