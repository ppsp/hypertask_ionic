export class ApiHttpError extends Error {

  httpStatus?: number = 404;
  applicationStatus?: number;
  errorMessageTranslationkey: string;
  handled: boolean = false;

  constructor(message?: string) {
    super(message);
    this.name = ApiHttpError.name;
    Object.setPrototypeOf(this, ApiHttpError.prototype);
  }
}
