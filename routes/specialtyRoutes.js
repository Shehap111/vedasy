import express from "express";
import {
  createSpecialty,
  getSpecialties,
  getSpecialtyById,
  updateSpecialty,
  deleteSpecialty,
} from "../controllers/specialtyController.js";
import { verifyAdmin } from '../middlewares/verifyAdmin.js';
    
const router = express.Router();

router.post("/", verifyAdmin, createSpecialty);
router.patch("/:id",verifyAdmin , updateSpecialty);
router.delete("/:id",verifyAdmin , deleteSpecialty);


router.get("/", getSpecialties);
router.get("/:id", getSpecialtyById);


export default router;
