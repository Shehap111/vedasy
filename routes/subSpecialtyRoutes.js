import express from "express";
import {
  createSubSpecialty,
  getSubSpecialties,
  getSubSpecialtiesBySpecialty,
  updateSubSpecialty,
  deleteSubSpecialty,
  getSubSpecialtyById,
} from "../controllers/subSpecialtyController.js";
import { verifyAdmin } from '../middlewares/verifyAdmin.js';

const router = express.Router();

router.post("/",  createSubSpecialty);
router.patch("/:id", verifyAdmin, updateSubSpecialty);
router.delete("/:id", verifyAdmin, deleteSubSpecialty);

router.get("/:id", getSubSpecialtyById);
router.get("/", getSubSpecialties);
router.get("/by-specialty/:specialtyId", getSubSpecialtiesBySpecialty);


export default router;
