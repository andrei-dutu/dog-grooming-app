import jwt from "jsonwebtoken";
import { HttpError } from "../utils/httpError.js";

/**
 * Verifies the Bearer JWT and attaches req.user = { id, role }.
 * Use before handlers that require a logged-in user.
 */
export function authenticate(req, _res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(new HttpError(401, "Authentication required"));
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return next(new HttpError(401, "Authentication required"));
  }

  if (!process.env.JWT_SECRET) {
    return next(new HttpError(500, "JWT_SECRET is not configured"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new HttpError(401, "Token expired"));
    }
    return next(new HttpError(401, "Invalid token"));
  }
}
