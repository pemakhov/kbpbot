export class ForbiddenError {
  name: string;
  message: string;
  nativeMessage: string;

  constructor(message = 'Access forbidden') {
    this.name = 'FORBIDDEN_ERROR';
    this.message = message;
    this.nativeMessage = 'Доступ заборонено';
  }
}
