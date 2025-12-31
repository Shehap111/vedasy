// routes/hospitalClinics.js
import express from "express";
import {
  createHospitalClinic,
  getHospitalClinics,
  getBranchClinics,
  getSingleHospitalClinic,
  updateHospitalClinic,
  deleteHospitalClinic,
  toggleHospitalClinicStatus,
} from "../controllers/hospitalClinicController.js";

const router = express.Router();


// CREATE
router.post("/", createHospitalClinic);

// GET all clinics for hospital
router.get("/hospital/:hospitalId", getHospitalClinics);

// GET clinics by branch
router.get("/branch/:branchId", getBranchClinics);

// GET single
router.get("/:clinicId", getSingleHospitalClinic);

// UPDATE
router.patch("/:clinicId", updateHospitalClinic);

// DELETE
router.delete("/:clinicId", deleteHospitalClinic);

// TOGGLE STATUS
router.patch("/:clinicId/toggle", toggleHospitalClinicStatus);


export default router;
