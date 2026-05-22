export const HTTP_STATUS_CODE = {
  ok: 200,
  created: 201,
  accepted: 202,
  noContent: 204,

  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  conflict: 409,
  unprocessableEntity: 422,
  tooManyRequests: 429,

  internalServerError: 500,
  serviceUnavailable: 503,
} as const;

export type HttpStatusCode = (typeof HTTP_STATUS_CODE)[keyof typeof HTTP_STATUS_CODE];

export interface JsonResponse<TBody> {
  readonly statusCode: number;
  readonly body: TBody;
}
