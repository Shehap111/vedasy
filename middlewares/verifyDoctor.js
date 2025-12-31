import jwt from "jsonwebtoken";
import Doctor from "../models/doctor.js";

export const verifyDoctor = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const doctor = await Doctor.findById(decoded.id);

    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    req.doctor = doctor;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};
