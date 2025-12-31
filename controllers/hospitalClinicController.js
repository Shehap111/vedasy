// controllers/hospitalClinicController.js
import HospitalClinic from "../models/HospitalClinic.js";
import Hospital from "../models/Hospital.js";
import Doctor from "../models/doctor.js";

export const createHospitalClinic = async (req, res) => {
  try {
    const clinic = await HospitalClinic.create(req.body);
    await Doctor.findByIdAndUpdate(
      req.body.doctor, // الـ doctor ID المرسل في body
      { $push: { hospitalClinic: clinic._id } },
      { new: true } // لو عايز ترجّع الدكتور بعد التحديث
    );

    res.status(201).json({ success: true, clinic });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const getHospitalClinics = async (req, res) => {
  try {
    const { hospitalId } = req.params;

    const clinics = await HospitalClinic.find({ hospital: hospitalId })
      .populate("specialty", "name")
      .populate("doctor", "name gender")
      .populate("hospital", "name branches"); // هنجيب الفروع من هنا

    const result = clinics.map((clinic) => {
      const hospital = clinic.hospital;

      // هات البرانش اللي ID بتاعه نفس اللي متخزن في العيادة
      const branchData = hospital.branches.find(
        (b) => b._id.toString() === clinic.branch.toString()
      );

      return {
        ...clinic._doc,
        branchInfo: branchData || null,
      };
    });

    res.status(200).json({ success: true, clinics: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// GET clinics by branch
export const getBranchClinics = async (req, res) => {
  try {
    const { branchId } = req.params;

    const clinics = await HospitalClinic.find({ branch: branchId })
      .populate("specialty", "name")
      .populate("doctor", "name gender");

    res.status(200).json({ success: true, clinics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// GET single clinic
export const getSingleHospitalClinic = async (req, res) => {
  try {
    const clinic = await HospitalClinic.findById(req.params.clinicId)
      .populate("specialty", "name")
      .populate("doctor", "name gender");

    res.status(200).json({ success: true, clinic });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// UPDATE Clinic
export const updateHospitalClinic = async (req, res) => {
  try {
    const clinic = await HospitalClinic.findByIdAndUpdate(
      req.params.clinicId,
      req.body,
      { new: true }
    );
    res.status(200).json({ success: true, clinic });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// DELETE Clinic
export const deleteHospitalClinic = async (req, res) => {
  try {
    await HospitalClinic.findByIdAndDelete(req.params.clinicId);
    res.status(200).json({ success: true, message: "Clinic removed" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// TOGGLE ACTIVE / INACTIVE
export const toggleHospitalClinicStatus = async (req, res) => {
  try {
    const clinic = await HospitalClinic.findById(req.params.clinicId);

    clinic.isActive = !clinic.isActive;
    await clinic.save();

    res.status(200).json({ success: true, clinic });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
