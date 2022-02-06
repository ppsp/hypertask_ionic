export class InvalidTaskGroupError extends Error {

  httpStatus?: number = 404;
  applicationStatus?: number;
  errorMessageTranslationkey: string;
  handled: boolean = false;

  constructor(message?: string) {
    super(message);
    this.name = InvalidTaskGroupError.name;
    Object.setPrototypeOf(this, InvalidTaskGroupError.prototype);
  }
}
