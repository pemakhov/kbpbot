export class ClientNotRespondingError extends Error {
  constructor(...params: any) {
    super(params);
    this.name = 'EClientNotRespondingError';
    this.message = 'Client is not responding';
  }
}
