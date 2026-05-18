import { HttpError } from "../utils/httpError.js";

export function errorHandler(err, _req, res, _next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }

  if (err.code === "P2002") {
    return res.status(409).json({ error: "A record with this value already exists" });
  }

  if (err.code === "P2003") {
    return res.status(400).json({ error: "Invalid reference to a related record" });
  }

  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}
