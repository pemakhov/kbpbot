export class ValidationError extends Error {
  nativeLanguageMessage: string;

  constructor(message: string, nativeLanguageMessage: string, ...params: any) {
    super(params);
    this.name = 'EValidationError';
    this.message = 'Request is not valid.';
    this.nativeLanguageMessage = nativeLanguageMessage;
  }
}
