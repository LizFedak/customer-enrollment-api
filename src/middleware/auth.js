const crypto = require("crypto");
const { ApiError } = require("../utils/errors");

function timingSafeEquals(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function validateApiKey(req, res, next) {
  const expectedApiKey = process.env.API_KEY || "demo-key";
  const providedApiKey = req.get("x-api-key");

  if (!providedApiKey || !timingSafeEquals(providedApiKey, expectedApiKey)) {
    next(new ApiError(401, "UNAUTHORIZED", "A valid x-api-key header is required."));
    return;
  }

  next();
}

module.exports = { validateApiKey };
