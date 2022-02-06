export class UnknownLanguageError extends Error {

  httpStatus?: number = 404;
  applicationStatus?: number;
  errorMessageTranslationkey: string;
  handled: boolean = false;

  constructor(message?: string) {
    super(message);
    this.name = UnknownLanguageError.name;
    Object.setPrototypeOf(this, UnknownLanguageError.prototype);
  }
}
