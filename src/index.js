const express = require("express");
const { router: applicationsRouter } = require("./routes/applications");
const { validateApiKey } = require("./middleware/auth");
const { correlationId } = require("./middleware/correlationId");
const { ApiError } = require("./utils/errors");
const { sendError } = require("./utils/responses");

const app = express();
const port = process.env.PORT || 3000;

app.disable("x-powered-by");
app.use(express.json({ limit: "256kb" }));
app.use(correlationId);
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} correlationId=${req.correlationId}`);
  next();
});
app.use(validateApiKey);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "Customer Enrollment API",
    timestamp: new Date().toISOString(),
    correlationId: req.correlationId,
  });
});

app.use("/applications", applicationsRouter);

app.use((req, res, next) => {
  next(new ApiError(404, "ROUTE_NOT_FOUND", `Route ${req.method} ${req.path} was not found.`));
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    sendError(res, req, 400, "INVALID_JSON", "Request body must contain valid JSON.");
    return;
  }

  if (err instanceof ApiError) {
    sendError(res, req, err.status, err.code, err.message);
    return;
  }

  console.error(`Unhandled error correlationId=${req.correlationId}`, err.message);
  sendError(res, req, 500, "INTERNAL_SERVER_ERROR", "An unexpected error occurred.");
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Customer Enrollment API listening on port ${port}`);
  });
}

module.exports = { app };
