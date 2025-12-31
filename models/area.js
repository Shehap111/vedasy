import mongoose from "mongoose";

const areaSchema = new mongoose.Schema(
  {
    governorate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Governorate",
      required: true,
    },
    name: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },      
  },
  { timestamps: true }
);

export default mongoose.model("Area", areaSchema);
