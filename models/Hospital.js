import mongoose from "mongoose";

const BranchSchema = new mongoose.Schema({
  name: {
    en: { type: String, required: true },
    ar: { type: String, required: true },
  },
  address: {
    en: { type: String },
    ar: { type: String },
  },
  governorate: { type: mongoose.Schema.Types.ObjectId, ref: "Governorate" },
  area: { type: mongoose.Schema.Types.ObjectId, ref: "Area" },

  location: { type: String }, // ممكن يكون إحداثيات أو وصف نصي

  phoneNumbers: [{ type: String }],
  workingHours: [
    {
      day: { type: String },
      from: { type: String },
      to: { type: String }
    }
  ],
  amenities: [{ type: String }],
  images: [{ type: String }],
  isActive: { type: Boolean, default: true } 
});


const HospitalSchema = new mongoose.Schema(
  {
    name: {
      en: { type: String, required: true },
      ar: { type: String }
    },
    slug: { type: String, index: true, unique: true }, 
    description: {
      en: { type: String },
      ar: { type: String }
    },
    type: { type: String, enum: ["hospital", "clinic", "diagnostic", "lab"], default: "clinic" },

    logo: { type: String },
    cover: { type: String },

    branches: [BranchSchema],

    doctors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Doctor" }],
    specialties: [{ type: mongoose.Schema.Types.ObjectId, ref: "Specialty" }],

    images: [{ type: String }],

    services: [{ type: String }],
    
    isActive: { type: Boolean, default: true },

    insuranceCompanies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Insurance" }],

    contact: {
      hotline: { type: String },
      email: { type: String },
      website: { type: String },
      whatsapp: { type: String }
    }
  },
  { timestamps: true }
);

export default mongoose.model("Hospital", HospitalSchema);
