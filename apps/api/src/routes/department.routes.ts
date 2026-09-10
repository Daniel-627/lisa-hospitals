import { Router } from "express";
export const departmentRoutes = Router();

departmentRoutes.get("/", (req, res) => {
  res.json({ message: "Department routes coming soon" });
});