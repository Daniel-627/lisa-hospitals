import { Router } from "express";
export const appointmentRoutes = Router();

appointmentRoutes.get("/", (req, res) => {
  res.json({ message: "Appointment routes coming soon" });
});