export class NotFoundError {
  name: string;
  message: string;
  nativeMessage: string;

  constructor(message = 'Resource not found') {
    this.name = 'NOT_FOUND_ERROR';
    this.message = message;
    this.nativeMessage = 'Не знайдено';
  }
}
