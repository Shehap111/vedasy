import mongoose from 'mongoose';

const medicalCenterSchema = new mongoose.Schema(
  {
    name: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },

    description: {
      en: { type: String },
      ar: { type: String },
    },

    address: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },

    locationLink: {
      type: String,
      required: true,
    },

    logo: {
      type: String,
      required: true, 
    },

    type: {
      type: String,
      enum: ['lab', 'radiology'],
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default
  mongoose.models.MedicalCenter ||
  mongoose.model('MedicalCenter', medicalCenterSchema);
