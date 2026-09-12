import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { sendError } from "../utils/response";
import { UserRole } from "@lisa/types";

export interface AuthRequest extends Request {
  user?: { id: string; role: UserRole; email: string };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return sendError(res, "No token provided", 401);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string; role: UserRole; email: string;
    };
    req.user = decoded;
    next();
  } catch {
    return sendError(res, "Invalid or expired token", 401);
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, "Access denied", 403);
    }
    next();
  };
};