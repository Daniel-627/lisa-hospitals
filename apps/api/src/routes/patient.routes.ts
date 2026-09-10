import { Router } from "express";
export const patientRoutes = Router();

patientRoutes.get("/", (req, res) => {
  res.json({ message: "Patient routes coming soon" });
});