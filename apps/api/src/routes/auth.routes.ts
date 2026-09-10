import { Router } from "express";
export const authRoutes = Router();

authRoutes.get("/", (req, res) => {
  res.json({ message: "Auth routes coming soon" });
});