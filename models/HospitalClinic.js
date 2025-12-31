// models/HospitalClinic.js
import mongoose from "mongoose";

const hospitalClinicSchema = new mongoose.Schema(
  {
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },

    branch: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    name: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },

    specialty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Specialty",
      required: true,
    },

doctor: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true, 
  },

    consultationFee: { type: Number, required: true },
    followUpFee: { type: Number },
    waitingTime: { type: Number, default: 0 },

    schedule: [
      {
        day: { type: String },
        from: { type: String },
        to: { type: String },
      },
    ],

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("HospitalClinic", hospitalClinicSchema);
