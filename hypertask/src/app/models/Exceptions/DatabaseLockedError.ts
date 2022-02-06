export class DatabaseLockedError extends Error {

  httpStatus?: number = 500;
  applicationStatus?: number;
  errorMessageTranslationkey: string;
  handled: boolean = false;

  constructor(message?: string) {
    super(message);
    this.name = DatabaseLockedError.name;
    Object.setPrototypeOf(this, DatabaseLockedError.prototype);
  }
}
