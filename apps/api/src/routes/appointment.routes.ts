import { Router } from "express";
import {
  createAppointment,
  getMyAppointments,
  getAppointmentById,
  cancelAppointment,
  getAllAppointments,
  updateAppointmentStatus,
} from "../controllers/appointment.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

export const appointmentRoutes = Router();

// Patient routes
appointmentRoutes.post("/",    authenticate, createAppointment);
appointmentRoutes.get("/mine", authenticate, getMyAppointments);
appointmentRoutes.get("/:id",  authenticate, getAppointmentById);
appointmentRoutes.patch("/:id/cancel", authenticate, cancelAppointment);

// Staff routes
appointmentRoutes.get("/",          authenticate, authorize("admin", "receptionist", "doctor", "nurse"), getAllAppointments);
appointmentRoutes.patch("/:id/status", authenticate, authorize("admin", "receptionist", "doctor", "nurse"), updateAppointmentStatus);