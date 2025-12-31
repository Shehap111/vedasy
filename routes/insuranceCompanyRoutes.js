import express from "express";
import {
  getInsuranceCompanyById,
  createInsuranceCompany,
  updateInsuranceCompany,
  deleteInsuranceCompany,
  toggleInsuranceCompanyStatus,
  getActiveInsuranceCompanies,
  getAllInsuranceCompaniesAdmin ,
} from "../controllers/insuranceCompanyController.js";
import { verifyAdmin } from '../middlewares/verifyAdmin.js';

const router = express.Router();

router.get("/allAdmin", verifyAdmin, getAllInsuranceCompaniesAdmin );

// ✅ Admin routes
router.post("/", verifyAdmin, createInsuranceCompany);
router.patch("/:id", verifyAdmin, updateInsuranceCompany);
router.delete("/:id", verifyAdmin, deleteInsuranceCompany);
router.patch("/toggle/:id", verifyAdmin, toggleInsuranceCompanyStatus);


// ✅ Public routes
router.get("/", getActiveInsuranceCompanies);
router.get("/:id", getInsuranceCompanyById);
export default router;
