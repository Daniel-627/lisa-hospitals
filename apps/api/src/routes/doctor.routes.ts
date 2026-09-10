import { Router } from "express";
export const doctorRoutes = Router();

doctorRoutes.get("/", (req, res) => {
  res.json({ message: "Doctor routes coming soon" });
});