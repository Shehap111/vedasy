import express from "express";
import {
  createReview,
  getReviews,
  getReviewsByDoctor,
} from "../controllers/reviewController.js";

const router = express.Router();

router.post("/", createReview);
router.get("/", getReviews);
router.get("/doctor/:doctorId", getReviewsByDoctor);

export default router;
