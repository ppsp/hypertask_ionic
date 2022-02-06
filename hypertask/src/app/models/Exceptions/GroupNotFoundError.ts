export class GroupNotFoundError extends Error {

  httpStatus?: number = 404;
  applicationStatus?: number;
  errorMessageTranslationkey: string;
  handled: boolean = false;

  constructor(message?: string) {
    super(message);
    this.name = GroupNotFoundError.name;
    Object.setPrototypeOf(this, GroupNotFoundError.prototype);
  }
}
