import express from "express";
import {
  createHospital,
  getActiveHospitals,
  getAllHospitals,
  getSingleHospital,
  updateHospital,
  deleteHospital,
  addBranch,
  updateBranch,
  deleteBranch,
  assignDoctor,
  removeDoctor,
  assignSpecialty,
  removeSpecialty,
  toggleHospitalOrBranch
} from "../controllers/hospitalController.js";

const router = express.Router();

// ============================
// HOSPITAL CRUD
// ============================
router.post("/", createHospital);           // Create Hospital
router.get("/", getAllHospitals);           // Get All Hospitals
router.get("/active", getActiveHospitals); // Get Active Hospitals
router.get("/:slug", getSingleHospital);    // Get Single Hospital by slug
router.patch("/:id", updateHospital);       // Update Hospital
router.delete("/:id", deleteHospital);      // Delete Hospital
// Toggle hospital
router.patch("/:hospitalId/toggle", toggleHospitalOrBranch);

// ============================
// BRANCHES
// ============================
router.post("/:id/branches", addBranch);                  // Add Branch
router.patch("/:id/branches/:branchId", updateBranch);   // Update Branch
router.delete("/:id/branches/:branchId", deleteBranch);  // Delete Branch
router.patch("/:hospitalId/toggle/:branchId", toggleHospitalOrBranch);

// ============================
// DOCTORS
// ============================
router.post("/:id/doctors", assignDoctor);               // Assign Doctor
router.delete("/:id/doctors/:doctorId", removeDoctor);   // Remove Doctor

// ============================
// SPECIALTIES
// ============================
router.post("/:id/specialties", assignSpecialty);        // Assign Specialty
router.delete("/:id/specialties/:specialtyId", removeSpecialty); // Remove Specialty

export default router;
