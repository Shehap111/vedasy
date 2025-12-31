import express from "express";
import {
  createDoctor,
  getDoctorById,
  updateDoctor,
  toggleDoctorStatus,
  deleteDoctor,
  getAllDoctors,
  getPublicDoctors,
  verifyDoctor,
  getDoctorBySlug,
} from "../controllers/doctorController.js";
import { verifyAdmin } from '../middlewares/verifyAdmin.js';
import {checkActiveById , checkActiveBySlug} from "../middlewares/checkActive.js";

const router = express.Router();

router.post("/", createDoctor);
// 🟢 Public
router.get("/public", getPublicDoctors);

// 🔵 Admin
router.get("/", verifyAdmin, getAllDoctors);

router.get("/:id", getDoctorById);
// checkActiveBySlug,
router.get("/slug/:slug", getDoctorBySlug); // new route by slug
router.patch("/:id", updateDoctor);
router.patch("/verify/:id", verifyAdmin, verifyDoctor);
router.patch("/toggle/:id", verifyAdmin, toggleDoctorStatus);
router.delete("/:id", verifyAdmin, deleteDoctor);

export default router;
