import Doctor from "../models/doctor.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    const doctor = await Doctor.findOne({ email }).select("+password");
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

const token = jwt.sign(
  { id: doctor._id, role: "doctor" }, // ← مهم جدًا
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);

    res.status(200).json({
      success: true,
      token,
      data: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialty: doctor.specialty,
        isActive: doctor.isActive,
        isVerified: doctor.isVerified,        
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
