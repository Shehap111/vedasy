// models/insuranceCompanyModel.js
import mongoose from "mongoose";

const insuranceCompanySchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: String,
  description: String,
  status: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("InsuranceCompany", insuranceCompanySchema);
