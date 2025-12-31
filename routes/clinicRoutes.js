import express from "express";
import {
  createClinic,
  getClinicById,
  updateClinic,
  deleteClinic,
  getAllClinics,
  getActiveClinics,
  toggleClinicStatus,
  getClinicsByDoctor,
} from "../controllers/clinicController.js";
import { verifyAdmin } from "../middlewares/verifyAdmin.js";
import { verifyAdminOrDoctor } from "../middlewares/verifyAdminOrDoctor.js";

const router = express.Router();

// ✅ CRUD للادمن فقط
router.post("/", verifyAdminOrDoctor, createClinic);
router.patch("/:id", verifyAdminOrDoctor, updateClinic);
router.delete("/:id", verifyAdminOrDoctor, deleteClinic);
router.patch("/:id/toggle", verifyAdminOrDoctor, toggleClinicStatus);

// ✅ الراوتات اللي الدكتور والأدمن ممكن يدخلوا عليها
router.get("/doctor/:doctorId", verifyAdminOrDoctor, getClinicsByDoctor);

// ✅ الراوتات العامة (Public) أو حسب اختيارك
router.get("/all",verifyAdmin, getAllClinics);
router.get("/active", getActiveClinics);
router.get("/:id", getClinicById);

export default router;
