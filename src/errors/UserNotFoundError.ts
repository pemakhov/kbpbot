export class UserNotFoundError extends Error {
  constructor(...params: any) {
    super(params);
    this.name = "EUserNotFoundError";
    this.message = "User with given username not found in database";
  }
}