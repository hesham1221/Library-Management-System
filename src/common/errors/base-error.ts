import { TMessage, errorMessages } from './messages';

class BaseError {
  public statusCode: number;
  constructor(
    public message: TMessage = errorMessages.DEFAULT,
    statusCode?: number,
  ) {
    this.message = message;
    this.statusCode = statusCode || message.code;
  }
}

export default BaseError;
