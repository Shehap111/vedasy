import express from "express";
import { registerAdmin, loginAdmin } from "../controllers/adminController.js";
import {verifyAdmin} from "../middlewares/verifyAdmin.js";

const router = express.Router();

router.post("/register", verifyAdmin, registerAdmin);
router.post("/login", loginAdmin);

export default router;
