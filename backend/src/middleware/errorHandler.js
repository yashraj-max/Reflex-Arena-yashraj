// Every error ends up here and leaves as JSON: { "detail": "message" }.
import mongoose from 'mongoose';

/** 404 for any /api route that does not exist. */
export function notFound(req, res) {
  res.status(404).json({ detail: `No route for ${req.method} ${req.originalUrl}` });
}

/** The last middleware: turns any thrown error into a clean JSON response. */
export function errorHandler(err, req, res, _next) {
  // Broken JSON in the request body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ detail: 'Request body is not valid JSON !' });
  }
  // Two answers for the same round arrived at the same time
  if (err instanceof mongoose.Error.VersionError) {
    return res.status(409).json({ detail: 'This round was already answered !' });
  }
  // Errors we threw on purpose (HttpError) have a status
  if (err.status && err.status < 500) {
    return res.status(err.status).json({ detail: err.message });
  }
  // Anything else is a bug or an outage: log it so it shows up in Render's Logs tab
  console.error(`💥 ${req.method} ${req.originalUrl}`, err);
  res.status(500).json({ detail: 'Something went wrong on the server' });
}
