// routes/appointmentRoutes.js
import express from "express";
import {
  createAppointment,
  cancelAppointment,
  getAppointmentsByClinic,
  getAppointmentsByPatient,
  getAvailableSlots, 
  updateAppointmentStatus,
  getAppointmentById
} from "../controllers/appointmentsController.js";
import {verifyAdminOrDoctor} from "../middlewares/verifyAdminOrDoctor.js";

const router = express.Router();

router.post("/", createAppointment);
router.patch("/:id/cancel", cancelAppointment);
router.get("/patient/:patientId", getAppointmentsByPatient);
router.get("/clinic/:clinicId/available/:date", getAvailableSlots);
router.get("/hospital-clinic/:hospitalClinicId/available/:date", getAvailableSlots);
router.get("/:id", getAppointmentById);

router.get("/clinic/:clinicId",verifyAdminOrDoctor,  getAppointmentsByClinic);
router.patch("/:id/status",verifyAdminOrDoctor, updateAppointmentStatus);

export default router;
