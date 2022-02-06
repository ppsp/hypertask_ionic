export class UserNotFoundError extends Error {

  httpStatus?: number = 404;
  applicationStatus?: number;
  errorMessageTranslationkey: string;
  handled: boolean = false;

  constructor(message?: string) {
    super(message);
    this.name = UserNotFoundError.name;
    Object.setPrototypeOf(this, UserNotFoundError.prototype);
  }
}
