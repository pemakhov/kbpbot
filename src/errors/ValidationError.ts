export class ValidationError extends Error {
  constructor(...params: any) {
    super(params);
    this.name = "EValidationError";
    this.message = "Request is not valid.";
  }
}