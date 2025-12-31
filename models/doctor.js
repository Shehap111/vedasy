import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: {
      en: { type: String, required: true, trim: true },
      ar: { type: String, required: true, trim: true },
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slogan: {
      en: { type: String, trim: true },
      ar: { type: String, trim: true },
    },
    description: {
      en: { type: String, trim: true },
      ar: { type: String, trim: true },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // Hide from API responses
    },
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    specialty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Specialty",
      required: true,
    },
subSpecialty: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubSpecialty",
  }
],
    degrees: {
      en: { type: String, trim: true },
      ar: { type: String, trim: true },
    },
    experienceYears: {
      type: Number,
    },
    profileImage: {
      type: String, // URL
    },
    clinics: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Clinic",
      },
    ],
    hospitalClinic: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "HospitalClinic",
      },
    ],    
    insuranceCompanies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InsuranceCompany",
      },
    ],
    ratingAverage: {
      type: Number,
      default: 0, 
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  needsVerification: { type: Boolean, default: true },    
  },
  { timestamps: true }
);

export default mongoose.model("Doctor", doctorSchema);
