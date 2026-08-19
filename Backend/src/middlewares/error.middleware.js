/**
 * Centralized error handler. Any `next(err)` call or rejected promise from an
 * asyncHandler-wrapped controller ends up here.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err);

  const status = err.status || err.statusCode || 500;

  res.status(status).json({
    message: err.message || "Something went wrong on the server.",
  });
}

function notFound(req, res) {
  res.status(404).json({ message: "Route not found." });
}

module.exports = { errorHandler, notFound };