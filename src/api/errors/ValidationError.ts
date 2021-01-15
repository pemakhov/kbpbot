export class ValidationError {
  name: string;
  message: string;
  nativeMessage: string;

  constructor(message = 'Validation failed') {
    this.name = 'VALIDATION_ERROR';
    this.message = message;
    this.nativeMessage = 'Помилка валідації';
  }
}
