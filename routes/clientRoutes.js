import express from "express";
import {
  registerClient,
  loginClient,
  getClientProfile,
  updatePoints,
  addToCart,
  removeFromCart,
  loginWithGoogle,
  loginWithFacebook,
  updateClientProfile,
  changePassword,
} from "../controllers/clientController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", registerClient);
router.post("/login", loginClient);
router.post("/google", loginWithGoogle);
router.post("/facebook", loginWithFacebook);
router.patch("/change-password", verifyToken, changePassword);



router.patch("/update", verifyToken, updateClientProfile);

router.get("/profile", verifyToken, getClientProfile);
router.patch("/points", verifyToken, updatePoints);
router.post("/cart", verifyToken, addToCart);
router.delete("/cart/:medicineId", verifyToken, removeFromCart);

export default router;
