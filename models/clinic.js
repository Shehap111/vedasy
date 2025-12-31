// models/Clinic.js
import mongoose from "mongoose";

const clinicSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },

  title: {
    en: { type: String, required: true },
    ar: { type: String, required: true }
  },

  address: {
    en: { type: String, required: true },
    ar: { type: String, required: true }
  },

  location: { type: String, required: true },

  phone: { type: String },

  images: [
    { type: String }
  ],

  workingHours: [
    {
      day: { type: String },
      from: { type: String },
      to: { type: String }
    }
  ],

  appointmentDuration: { type: Number, default: 30 },
  slotCapacity: { type: Number, default: 1 },
  isActive: { type: Boolean, default: false },

  examinationPrice: { type: Number, required: true },

  // ✅ إضافة ObjectId للمحافظة والمنطقة
  governorate: { type: mongoose.Schema.Types.ObjectId, ref: "Governorate", required: true },
  area: { type: mongoose.Schema.Types.ObjectId, ref: "Area", required: true },

}, { timestamps: true });

export default mongoose.model("Clinic", clinicSchema);
