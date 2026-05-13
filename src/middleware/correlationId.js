const { randomUUID } = require("crypto");

function correlationId(req, res, next) {
  const incomingCorrelationId = req.get("x-correlation-id");
  const requestCorrelationId =
    typeof incomingCorrelationId === "string" && incomingCorrelationId.trim().length > 0
      ? incomingCorrelationId.trim()
      : `corr_demo_${randomUUID()}`;

  req.correlationId = requestCorrelationId;
  res.set("x-correlation-id", requestCorrelationId);
  next();
}

module.exports = { correlationId };
