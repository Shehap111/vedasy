import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import clinicRoutes from "./routes/clinicRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import path from "path";
import specialtyRoutes from "./routes/specialtyRoutes.js";
import subSpecialtyRoutes from "./routes/subSpecialtyRoutes.js";
import governorateRoutes from "./routes/governorateRoutes.js";
import areaRoutes from "./routes/areaRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import uploadRoute from "./routes/uploadRoute.js";
import insuranceCompanyRoutes from "./routes/insuranceCompanyRoutes.js";
import doctorAuthRoutes from "./routes/doctorAuthRoutes.js";
import hospitalRoutes from "./routes/hospitalRoutes.js";
import hospitalClinicRoutes from "./routes/hospitalClinics.js";  
import offersRoutes from './routes/offersRoutes.js'
import questionRoutes from './routes/questionRoutes.js'
import medicalCenterRoutes from './routes/medicalCenterRoutes.js';

dotenv.config();
const app = express();


// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

connectDB();

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ DB connection error:", err));
// Serve static files for uploads
app.use('/uploads', express.static(path.join('uploads')));

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api', uploadRoute);
app.use("/api/doctors", doctorRoutes);
app.use("/api/clinics", clinicRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/specialties", specialtyRoutes);
app.use("/api/sub-specialties", subSpecialtyRoutes);
app.use("/api/governorates", governorateRoutes);
app.use("/api/areas", areaRoutes);
app.use("/api/clients", clientRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/contact', contactRoutes);
app.use("/api/insurance-companies", insuranceCompanyRoutes);
app.use("/api/doctors/auth", doctorAuthRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/hospital-clinics", hospitalClinicRoutes);
app.use("/api/offers", offersRoutes);
app.use("/api/questions", questionRoutes);
app.use('/api/medical-centers', medicalCenterRoutes);


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
