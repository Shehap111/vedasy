// models/Review.js
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    reviewerName: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: "",
      trim: true,
    },
    visitType: {
      type: String,
      enum: ["Clinic", "Hospital", "Online"], 
      default: "Clinic",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Review", reviewSchema);
