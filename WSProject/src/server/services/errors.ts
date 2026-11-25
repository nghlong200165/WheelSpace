import "server-only";

// Expected business error whose message can be shown to the user as-is.
export class ServiceError extends Error {
  constructor(
    message: string,
    readonly field?: string,
  ) {
    super(message);
    this.name = "ServiceError";
  }
}
