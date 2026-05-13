const VALID_PRODUCT_TYPES = ["checking", "savings", "credit-card"];
const VALID_STATUSES = ["submitted", "in-review", "approved", "rejected", "cancelled"];

function requireObject(value, name, errors) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    errors.push(`${name} must be an object.`);
    return false;
  }
  return true;
}

function requireString(value, name, errors, options = {}) {
  if (typeof value !== "string" || value.trim().length === 0) {
    errors.push(`${name} is required.`);
    return;
  }

  if (options.pattern && !options.pattern.test(value)) {
    errors.push(`${name} has an invalid format.`);
  }

  if (options.allowed && !options.allowed.includes(value)) {
    errors.push(`${name} must be one of: ${options.allowed.join(", ")}.`);
  }
}

function requireBoolean(value, name, errors) {
  if (typeof value !== "boolean") {
    errors.push(`${name} must be a boolean.`);
  }
}

function validateCreateApplication(body) {
  const errors = [];

  if (!requireObject(body, "request body", errors)) {
    return errors;
  }

  requireString(body.productType, "productType", errors, { allowed: VALID_PRODUCT_TYPES });

  if (typeof body.initialDepositAmount !== "number" || Number.isNaN(body.initialDepositAmount) || body.initialDepositAmount < 0) {
    errors.push("initialDepositAmount must be a number greater than or equal to 0.");
  }

  if (requireObject(body.customer, "customer", errors)) {
    requireString(body.customer.firstName, "customer.firstName", errors);
    requireString(body.customer.lastName, "customer.lastName", errors);
    requireString(body.customer.dateOfBirth, "customer.dateOfBirth", errors, { pattern: /^\d{4}-\d{2}-\d{2}$/ });
    requireString(body.customer.email, "customer.email", errors, { pattern: /^[^@\s]+@[^@\s]+\.[^@\s]+$/ });
    requireString(body.customer.phone, "customer.phone", errors);
    requireString(body.customer.taxIdLast4, "customer.taxIdLast4", errors, { pattern: /^\d{4}$/ });

    if (requireObject(body.customer.address, "customer.address", errors)) {
      requireString(body.customer.address.line1, "customer.address.line1", errors);
      requireString(body.customer.address.city, "customer.address.city", errors);
      requireString(body.customer.address.state, "customer.address.state", errors, { pattern: /^[A-Z]{2}$/ });
      requireString(body.customer.address.postalCode, "customer.address.postalCode", errors);
      requireString(body.customer.address.country, "customer.address.country", errors, { pattern: /^[A-Z]{2}$/ });
    }
  }

  if (requireObject(body.consent, "consent", errors)) {
    requireBoolean(body.consent.acceptedTerms, "consent.acceptedTerms", errors);
    requireBoolean(body.consent.marketingOptIn, "consent.marketingOptIn", errors);

    if (body.consent.acceptedTerms === false) {
      errors.push("consent.acceptedTerms must be true.");
    }
  }

  return errors;
}

function validateStatusUpdate(body) {
  const errors = [];

  if (!requireObject(body, "request body", errors)) {
    return errors;
  }

  requireString(body.status, "status", errors, { allowed: VALID_STATUSES.filter((status) => status !== "submitted") });

  if (body.reason !== undefined && (typeof body.reason !== "string" || body.reason.trim().length < 3)) {
    errors.push("reason must be at least 3 characters when provided.");
  }

  return errors;
}

function parseListQuery(query) {
  const errors = [];
  const status = query.status;
  const productType = query["product-type"];
  const limit = query.limit === undefined ? 25 : Number(query.limit);
  const offset = query.offset === undefined ? 0 : Number(query.offset);

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    errors.push(`status must be one of: ${VALID_STATUSES.join(", ")}.`);
  }

  if (productType !== undefined && !VALID_PRODUCT_TYPES.includes(productType)) {
    errors.push(`product-type must be one of: ${VALID_PRODUCT_TYPES.join(", ")}.`);
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    errors.push("limit must be an integer between 1 and 100.");
  }

  if (!Number.isInteger(offset) || offset < 0) {
    errors.push("offset must be an integer greater than or equal to 0.");
  }

  return {
    filters: {
      status,
      productType,
      limit,
      offset,
    },
    errors,
  };
}

module.exports = {
  VALID_PRODUCT_TYPES,
  VALID_STATUSES,
  parseListQuery,
  validateCreateApplication,
  validateStatusUpdate,
};
