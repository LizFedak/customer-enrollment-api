function responseMeta(req, extra = {}) {
  return {
    correlationId: req.correlationId,
    timestamp: new Date().toISOString(),
    ...extra,
  };
}

function sendData(res, req, status, data, extraMeta = {}) {
  res.status(status).json({
    data,
    meta: responseMeta(req, extraMeta),
  });
}

function sendError(res, req, status, code, message) {
  res.status(status).json({
    error: {
      code,
      message,
      correlationId: req.correlationId || "corr_demo_unavailable",
    },
  });
}

module.exports = { responseMeta, sendData, sendError };
