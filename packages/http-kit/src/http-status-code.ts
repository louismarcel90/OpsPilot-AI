export const HTTP_STATUS_CODE = {
  ok: 200,
  badRequest: 400,
  forbidden: 403,
  notFound: 404,
  internalServerError: 500,
} as const;

export interface JsonResponse<TBody> {
  readonly statusCode: number;
  readonly body: TBody;
}
