export class RepeatingMessageIdError extends Error {
  constructor(...params: any) {
    super(params);
    this.name = 'ERepeatingMessageIdError';
    this.message = 'Repeating message Id';
  }
}
