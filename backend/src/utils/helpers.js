// Async handler to catch errors in async functions
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

// Format date
const formatDate = (date) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
};

// Generate random string
const generateRandomString = (length = 10) => {
  return Math.random()
    .toString(36)
    .substring(2, length + 2);
};

// Paginate results using a consistent `{ data, pagination }` shape.
// Keep legacy `results/total` keys for compatibility with older callers.
const paginate = (data, page, limit, totalCount) => {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.max(1, parseInt(limit, 10) || 10);
  const total =
    Number.isFinite(totalCount) && totalCount >= 0
      ? totalCount
      : Array.isArray(data)
        ? data.length
        : 0;
  const pages = Math.max(1, Math.ceil(total / safeLimit));

  return {
    data,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      pages,
    },
    results: data,
    total,
  };
};

module.exports = {
  asyncHandler,
  formatCurrency,
  formatDate,
  generateRandomString,
  paginate,
};
