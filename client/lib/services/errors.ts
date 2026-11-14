export type ServiceErrorCode = "unauthenticated" | "forbidden" | "not_found" | "invalid_credentials" | "conflict" | "storage";

export class ServiceError extends Error {
  constructor(
    public readonly code: ServiceErrorCode,
    message: string,
    public readonly field?: string,
  ) {
    super(message);
    this.name = "ServiceError";
  }
}

export function errorMessage(error: unknown, fallback = "მოქმედება ვერ შესრულდა. სცადეთ თავიდან."): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
