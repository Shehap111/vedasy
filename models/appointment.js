// models/Appointment.js
import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  clinic: {type: mongoose.Schema.Types.ObjectId, ref: "Clinic"},
hospitalClinic: { 
  type: mongoose.Schema.Types.ObjectId, 
  ref: "HospitalClinic",
  required: function() {
    return !this.clinic;
  }
},  
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: false }, // null for guest bookings if you allow
  patientName: { type: String, required: true },
  patientPhone: { type: String, required: true },
  slotStart: { type: Date, required: true },
  slotEnd: { type: Date, required: true },
  status: { type: String, enum: ["booked","cancelled","completed","no-show"], default: "booked" },
  createdByGuest: { type: Boolean, default: false }, // إذا مفيش تسجيل
  meta: {type: Object}, 
  hasReview: { type: Boolean, default: false }, 
}, { timestamps: true });

// لمنع الحجز المتكرر: سنستخدم فحص تنافسي بدل index وحيد (لأن slotCapacity>1 ممكن)
appointmentSchema.index({ clinic: 1, slotStart: 1 });

export default mongoose.model("Appointment", appointmentSchema);
