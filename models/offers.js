import mongoose from "mongoose";

const offersSchema = new mongoose.Schema({
  title: {
    en: { type: String, required: true },
    ar: { type: String, required: true },
  },

  description: {
    en: { type: String },
    ar: { type: String },
  },

  images: [{ type: String }],

  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  specialty: { type: mongoose.Schema.Types.ObjectId, ref: "Specialty", required: true },

  clinic: {
    name: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },
    address: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },
    locationLink: { type: String }
  },

  workingHours: [
    {
      day: { type: String },
      from: { type: String },
      to: { type: String }
    }
  ],

  appointmentDuration: { type: Number, default: 30 },

  governorate: { type: mongoose.Schema.Types.ObjectId, ref: "Governorate", required: true },

  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },

  discountType: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
  discountValue: { type: Number, required: true },
  price: { type: Number, default: 0 },

  slug: { type: String, required: true, unique: true },

  // 🟩🟩 New Field — Verified System
  isVerified: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Offer", offersSchema);

