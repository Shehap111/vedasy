import express from "express";
import {
  getAllOffers,
  getOfferBySlug,
  getActiveOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  toggleOfferState,
  verifyOffer
} from "../controllers/offersController.js";

import { verifyAdmin } from "../middlewares/verifyAdmin.js";

const router = express.Router();

// =====================
// Public routes
// =====================
router.get("/", getAllOffers);           // جلب كل العروض
router.get("/active", getActiveOffers);  // جلب العروض النشطة للمستخدمين
router.get("/:slug", getOfferBySlug);    // جلب عرض معين بالـ slug

// =====================
// Admin routes (protected)
// =====================
router.post("/",  createOffer);                // إنشاء عرض جديد
router.patch("/:id", verifyAdmin, updateOffer);           // تعديل عرض
router.delete("/:id", verifyAdmin, deleteOffer);          // حذف عرض
router.patch("/toggle/:id", verifyAdmin, toggleOfferState); // تفعيل/تعطيل العرض
router.patch("/verify/:id", verifyAdmin, verifyOffer);

export default router;
