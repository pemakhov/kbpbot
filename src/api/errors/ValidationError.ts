export class ValidationError {
  name: string;
  message: string;

  constructor(message = 'Validation failed') {
    this.name = 'VALIDATION_ERROR';
    this.message = message;
  }
}
