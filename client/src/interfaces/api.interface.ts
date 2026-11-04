export interface IPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface IApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  pagination?: IPaginationMeta;
  error?: unknown;
}
