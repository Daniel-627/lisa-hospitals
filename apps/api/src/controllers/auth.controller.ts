import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "@lisa/db";
import { users, patients } from "@lisa/db";
import { eq } from "drizzle-orm";
import { sendSuccess, sendError } from "../utils/response";
import { AuthRequest } from "../middleware/auth.middleware";
import { z } from "zod";

// ── SCHEMAS ───────────────────────────────────────────────────────────────────

const registerSchema = z.object({
  email:     z.string().email(),
  phone:     z.string().min(10),
  password:  z.string().min(6),
  firstName: z.string().min(1),
  lastName:  z.string().min(1),
});

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

// ── HELPERS ───────────────────────────────────────────────────────────────────

const generateAccessToken = (id: string, role: string, email: string) =>
  jwt.sign({ id, role, email }, process.env.JWT_SECRET!, { expiresIn: "15m" });

const generateRefreshToken = (id: string) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET!, { expiresIn: "7d" });

const generatePatientNumber = () =>
  `PT-${Date.now().toString().slice(-6)}`;

// ── REGISTER ──────────────────────────────────────────────────────────────────

export const register = async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, parsed.error.errors[0].message, 422);
    }

    const { email, phone, password, firstName, lastName } = parsed.data;

    // Check if user exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      return sendError(res, "An account with this email already exists", 409);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const [newUser] = await db.insert(users).values({
      email,
      phone,
      passwordHash,
      firstName,
      lastName,
      role: "patient",
    }).returning();

    // Create patient profile
    await db.insert(patients).values({
      userId:        newUser.id,
      patientNumber: generatePatientNumber(),
      dateOfBirth:   "2000-01-01", // updated in profile setup
      gender:        "other",      // updated in profile setup
    });

    // Generate tokens
    const accessToken  = generateAccessToken(newUser.id, newUser.role, newUser.email);
    const refreshToken = generateRefreshToken(newUser.id);

    // Save refresh token
    await db.update(users)
      .set({ refreshToken })
      .where(eq(users.id, newUser.id));

    return sendSuccess(res, {
      accessToken,
      refreshToken,
      user: {
        id:        newUser.id,
        email:     newUser.email,
        phone:     newUser.phone,
        role:      newUser.role,
        firstName: newUser.firstName,
        lastName:  newUser.lastName,
      },
    }, "Account created successfully", 201);

  } catch (err) {
    console.error("Register error:", err);
    return sendError(res, "Something went wrong", 500);
  }
};

// ── LOGIN ─────────────────────────────────────────────────────────────────────

export const login = async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, parsed.error.errors[0].message, 422);
    }

    const { email, password } = parsed.data;

    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) return sendError(res, "Invalid email or password", 401);
    if (!user.isActive) return sendError(res, "Account is deactivated", 403);

    // Check password
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return sendError(res, "Invalid email or password", 401);

    // Generate tokens
    const accessToken  = generateAccessToken(user.id, user.role, user.email);
    const refreshToken = generateRefreshToken(user.id);

    // Save refresh token
    await db.update(users)
      .set({ refreshToken })
      .where(eq(users.id, user.id));

    return sendSuccess(res, {
      accessToken,
      refreshToken,
      user: {
        id:        user.id,
        email:     user.email,
        phone:     user.phone,
        role:      user.role,
        firstName: user.firstName,
        lastName:  user.lastName,
      },
    }, "Login successful");

  } catch (err) {
    console.error("Login error:", err);
    return sendError(res, "Something went wrong", 500);
  }
};

// ── REFRESH ───────────────────────────────────────────────────────────────────

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return sendError(res, "Refresh token required", 400);

    // Verify token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!
    ) as { id: string };

    // Find user and match token
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.id))
      .limit(1);

    if (!user || user.refreshToken !== refreshToken) {
      return sendError(res, "Invalid refresh token", 401);
    }

    // Issue new tokens
    const newAccessToken  = generateAccessToken(user.id, user.role, user.email);
    const newRefreshToken = generateRefreshToken(user.id);

    await db.update(users)
      .set({ refreshToken: newRefreshToken })
      .where(eq(users.id, user.id));

    return sendSuccess(res, {
      accessToken:  newAccessToken,
      refreshToken: newRefreshToken,
    });

  } catch {
    return sendError(res, "Invalid or expired refresh token", 401);
  }
};

// ── LOGOUT ────────────────────────────────────────────────────────────────────

export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return sendError(res, "Refresh token required", 400);

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!
    ) as { id: string };

    // Clear refresh token
    await db.update(users)
      .set({ refreshToken: null })
      .where(eq(users.id, decoded.id));

    return sendSuccess(res, null, "Logged out successfully");

  } catch {
    return sendError(res, "Invalid token", 401);
  }
};

// ── ME ────────────────────────────────────────────────────────────────────────

export const me = async (req: AuthRequest, res: Response) => {
  try {
    const [user] = await db
      .select({
        id:        users.id,
        email:     users.email,
        phone:     users.phone,
        role:      users.role,
        firstName: users.firstName,
        lastName:  users.lastName,
        isActive:  users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, req.user!.id))
      .limit(1);

    if (!user) return sendError(res, "User not found", 404);

    return sendSuccess(res, user);

  } catch (err) {
    console.error("Me error:", err);
    return sendError(res, "Something went wrong", 500);
  }
};