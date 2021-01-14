export class ForbiddenError {
  name: string;
  message: string;

  constructor(message = 'Access forbidden') {
    this.name = 'FORBIDDEN_ERROR';
    this.message = message;
  }
}
