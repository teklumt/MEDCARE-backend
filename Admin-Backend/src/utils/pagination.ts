export type PaginationInput = {
  page?: number;
  limit?: number;
};

export const getPagination = ({ page = 1, limit = 20 }: PaginationInput) => {
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const safeLimit = Number.isFinite(limit) && limit > 0 && limit <= 100 ? limit : 20;
  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
  };
};
