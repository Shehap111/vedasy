// controllers/clinicController.js
import Clinic from "../models/clinic.js";
import Doctor from "../models/doctor.js";

// Create clinic
export const createClinic = async (req, res) => {
  try {
    const clinic = await Clinic.create(req.body);
    await Doctor.findByIdAndUpdate(
      clinic.doctor,     // الـ doctorId المرسل
      { $push: { clinics: clinic._id } },   // ضيف ID العيادة
      { new: true }
    );

    res.status(201).json({ success: true, clinic });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};


// Get ALL clinics
export const getAllClinics = async (req, res) => {
  try {
    const filter = {};
    if (req.query.doctor) filter.doctor = req.query.doctor;

    // Populate doctor
    const clinics = await Clinic.find(filter)
      .populate('doctor', 'name phone email') // اختار الحقول اللي عايز ترجعها
      .populate('governorate', 'name id')
      .populate('area', 'name id')
      .sort({ createdAt: -1 });

    res.json({ success: true, clinics });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// Get ACTIVE clinics only
export const getActiveClinics = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.doctor) filter.doctor = req.query.doctor;

    const clinics = await Clinic.find(filter)
      .populate('doctor', 'name phone email') // populate doctor fields
      .sort({ createdAt: -1 });

    res.json({ success: true, clinics });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single clinic
export const getClinicById = async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.params.id)
      .populate('doctor', 'name phone email'); // populate doctor fields
    if (!clinic) return res.status(404).json({ success: false, message: "Clinic not found" });

    res.json({ success: true, clinic });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get clinics by doctor
export const getClinicsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const clinics = await Clinic.find({ doctor: doctorId })
      .populate("doctor", "name phone email");

    if (!clinics || clinics.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No clinics found for this doctor"
      });
    }

    res.json({
      success: true,
      clinics
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};



// Update clinic
export const updateClinic = async (req, res) => {
  try {
    const clinic = await Clinic.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!clinic) return res.status(404).json({ success: false, message: "Clinic not found" });

    res.json({ success: true, clinic });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete clinic
export const deleteClinic = async (req, res) => {
  try {
    const clinic = await Clinic.findByIdAndDelete(req.params.id);
    if (!clinic) return res.status(404).json({ success: false, message: "Clinic not found" });

    res.json({ success: true, message: "Clinic deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Toggle clinic active/inactive
export const toggleClinicStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const clinic = await Clinic.findById(id);
    if (!clinic) {
      return res.status(404).json({ success: false, message: "Clinic not found" });
    }

    clinic.isActive = !clinic.isActive;
    await clinic.save();

    res.json({
      success: true,
      message: `Clinic is now ${clinic.isActive ? "Active" : "Inactive"}`,
      clinic
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
