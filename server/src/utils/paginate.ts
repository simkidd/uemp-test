import { Query } from "mongoose";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface PaginateOptions {
  defaultLimit?: number;
  maxLimit?: number;
}

/**
 * Executes a Mongoose query with automatic pagination, counting, and metadata calculation.
 *
 * @example
 * const { data: users, pagination } = await paginate(
 *   User.find(query).populate("department").sort({ createdAt: -1 }),
 *   req.query
 * );
 * return sendSuccess(res, users, "Users retrieved", 200, pagination);
 */
export async function paginate<T>(
  query: Query<T[], any>,
  queryParams: { page?: unknown; limit?: unknown } = {},
  options: PaginateOptions = {},
): Promise<PaginatedResult<T>> {
  const page = Math.max(1, parseInt(String(queryParams.page || 1), 10) || 1);
  const defaultLimit = options.defaultLimit ?? 20;
  const maxLimit = options.maxLimit ?? 100;
  const rawLimit = parseInt(String(queryParams.limit || defaultLimit), 10) || defaultLimit;
  const limit = Math.max(1, Math.min(maxLimit, rawLimit));
  const skip = (page - 1) * limit;

  const filter = query.getFilter();
  const countQuery = query.model.countDocuments(filter);

  const [data, total] = await Promise.all([
    query.skip(skip).limit(limit).exec(),
    countQuery.exec(),
  ]);

  const totalPages = total > 0 ? Math.ceil(total / limit) : 0;

  return {
    data: data as T[],
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}
