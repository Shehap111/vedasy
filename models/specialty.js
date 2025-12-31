import mongoose from "mongoose";

const specialtySchema = new mongoose.Schema(
  {
    name: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },
    description: {
      en: { type: String },
      ar: { type: String },
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },    
    image: { type: String },
    isActive: { type: Boolean, default: true },
  },
  
  { timestamps: true }
);

const Specialty = mongoose.model("Specialty", specialtySchema);
export default Specialty;
