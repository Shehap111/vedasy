import mongoose from "mongoose";

const subSpecialtySchema = new mongoose.Schema(
  {
    name: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },
    description: {
      en: { type: String },
      ar: { type: String },
    },
    specialty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Specialty",
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },       
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const SubSpecialty = mongoose.model("SubSpecialty", subSpecialtySchema);
export default SubSpecialty;
