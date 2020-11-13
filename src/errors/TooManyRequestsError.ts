export class TooManyRequestsError extends Error {
  constructor(limit: number, ...params: any) {
    super(params);
    this.name = "ETooManyRequestsError";
    this.message = `Requests rate of ${limit} per minute is exceeded`;
  }
}