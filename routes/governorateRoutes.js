import express from "express";
import {
  createGovernorate,
  getGovernorates,
  updateGovernorate,
  deleteGovernorate,
  toggleGovernorateStatus,
  getGovernorateById,
} from "../controllers/governorateController.js";
import { verifyAdmin } from '../middlewares/verifyAdmin.js';

const router = express.Router();

router.post("/", verifyAdmin, createGovernorate);
router.patch("/:id", verifyAdmin, updateGovernorate);
router.delete("/:id", verifyAdmin, deleteGovernorate);
router.patch("/:id/toggle", verifyAdmin, toggleGovernorateStatus);


router.get("/", getGovernorates);
router.get("/:id", getGovernorateById);

export default router;
