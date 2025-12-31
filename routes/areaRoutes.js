import express from "express";
import {
  createArea,
  getAreas,
  getAreasByGovernorate,
  updateArea,
  deleteArea,
  toggleAreaStatus,
  getAreaById,
} from "../controllers/areaController.js";
import { verifyAdmin } from '../middlewares/verifyAdmin.js';

const router = express.Router();

router.post("/", verifyAdmin, createArea);
router.patch("/:id", verifyAdmin, updateArea);
router.delete("/:id", verifyAdmin, deleteArea);
// router.patch("/:id/toggle", verifyAdmin, toggleAreaStatus);


router.get("/", getAreas);
router.get("/by-governorate/:govId", getAreasByGovernorate);
router.get("/:id", getAreaById);


export default router;
