const express = require("express");
const {
  createApplication,
  deleteApplication,
  getApplication,
  listApplications,
  updateApplicationStatus,
} = require("../data/applications");
const { ApiError } = require("../utils/errors");
const { sendData } = require("../utils/responses");
const {
  parseListQuery,
  validateCreateApplication,
  validateStatusUpdate,
} = require("../utils/validation");

const router = express.Router();

router.post("/", (req, res, next) => {
  const validationErrors = validateCreateApplication(req.body);

  if (validationErrors.length > 0) {
    next(new ApiError(400, "VALIDATION_ERROR", validationErrors.join(" ")));
    return;
  }

  const application = createApplication(req.body);
  sendData(res, req, 201, application);
});

router.get("/", (req, res, next) => {
  const { filters, errors } = parseListQuery(req.query);

  if (errors.length > 0) {
    next(new ApiError(400, "VALIDATION_ERROR", errors.join(" ")));
    return;
  }

  const result = listApplications(filters);
  sendData(res, req, 200, result.applications, {
    count: result.applications.length,
    total: result.total,
    limit: filters.limit,
    offset: filters.offset,
  });
});

router.get("/:applicationId", (req, res, next) => {
  const application = getApplication(req.params.applicationId);

  if (!application) {
    next(new ApiError(404, "APPLICATION_NOT_FOUND", `Application ${req.params.applicationId} was not found.`));
    return;
  }

  sendData(res, req, 200, application);
});

router.patch("/:applicationId/status", (req, res, next) => {
  const validationErrors = validateStatusUpdate(req.body);

  if (validationErrors.length > 0) {
    next(new ApiError(400, "VALIDATION_ERROR", validationErrors.join(" ")));
    return;
  }

  const result = updateApplicationStatus(req.params.applicationId, req.body.status, req.body.reason);

  if (!result.application) {
    next(new ApiError(404, "APPLICATION_NOT_FOUND", `Application ${req.params.applicationId} was not found.`));
    return;
  }

  if (!result.transitionAllowed) {
    next(
      new ApiError(
        409,
        "INVALID_STATUS_TRANSITION",
        `Cannot transition application from ${result.application.status} to ${req.body.status}.`
      )
    );
    return;
  }

  sendData(res, req, 200, result.application);
});

router.delete("/:applicationId", (req, res, next) => {
  const deletedApplication = deleteApplication(req.params.applicationId);

  if (!deletedApplication) {
    next(new ApiError(404, "APPLICATION_NOT_FOUND", `Application ${req.params.applicationId} was not found.`));
    return;
  }

  sendData(res, req, 200, deletedApplication);
});

module.exports = { router };
