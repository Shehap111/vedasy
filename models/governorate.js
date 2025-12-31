import mongoose from "mongoose";

const governorateSchema = new mongoose.Schema(
  {
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

export default mongoose.model("Governorate", governorateSchema);
