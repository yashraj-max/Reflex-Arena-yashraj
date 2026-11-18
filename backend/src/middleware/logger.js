// Prints one line per request, e.g.  POST /api/answer 200 34ms
// On Render you can watch these live in the "Logs" tab - this is how
// you maintain an app in production: you read what it is doing.
export function requestLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`);
  });
  next();
}
