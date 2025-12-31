import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import Doctor from "../models/doctor.js";

export const verifyAdminOrDoctor = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user = null;

    if (decoded.role === "admin") {
      user = await Admin.findById(decoded.id);
    } else if (decoded.role === "doctor") {
      user = await Doctor.findById(decoded.id);
    }

    if (!user) {
      return res.status(403).json({ message: "Not allowed" });
    }

    req.user = user;
    req.role = decoded.role;
    next();

  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
