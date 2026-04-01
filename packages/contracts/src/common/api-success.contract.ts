export interface ApiSuccessContract<TData> {
  readonly data: TData;
  readonly correlationId: string;
}
