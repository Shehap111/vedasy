import Hospital from "../models/Hospital.js";
import Doctor from "../models/doctor.js";
import Review from "../models/review.js";
import mongoose from "mongoose";

// ============================
// CREATE HOSPITAL
// ============================
// ✅ Create new hospital
export const createHospital = async (req, res) => {
  try {
    const { name, description, type, logo, cover, branches, doctors, specialties, images, services, insuranceCompanies, contact } = req.body;

    // 🔹 توليد slug من الاسم العربي
    let baseSlug = name.ar.trim();
    baseSlug = baseSlug.replace(/\s+/g, "-"); // استبدال المسافات بـ "-"
    let slug = baseSlug;
    let count = 1;

    while (await Hospital.findOne({ slug })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    // 🔹 إنشاء المستشفى
    const hospital = await Hospital.create({
      name,
      slug,
      description,
      type,
      logo,
      cover,
      branches,
      doctors,
      specialties,
      images,
      services,
      insuranceCompanies,
      contact
    });

    res.status(201).json({ success: true, data: hospital });
  } catch (error) {
    console.error("Create hospital error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
// ============================
// GET ALL HOSPITALS
// Filters: city / area / type / specialty / insurance
// ============================
export const getAllHospitals = async (req, res) => {
  try {
    const { governorate, area, type, specialty, insurance, page = 1, limit = 20 } = req.query;

    const filter = {};

    if (governorate) filter["branches.governorate"] = governorate;
    if (area) filter["branches.area"] = area;
    if (type) filter.type = type;
    if (specialty) filter.specialties = specialty;

    const hospitals = await Hospital.find(filter)
          .populate("specialties", "name image")
          .populate({
              path: "doctors",
              select: "name specialty gender isVerified rating profileImage",
              populate: {
                  path: "specialty",
                  select: "name",
              },
          })
        .skip((page - 1) * limit)
      .limit(limit);

    const count = await Hospital.countDocuments(filter);

    res.json({
      success: true,
      count,
      data: hospitals,
      currentPage: +page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getActiveHospitals = async (req, res) => {
  try {
    const { governorate, area, type, specialty, insurance, page = 1, limit = 20 } = req.query;

    const filter = { isActive: true }; // ✅ نجيب المستشفيات النشطة فقط

    if (governorate) filter["branches.governorate"] = governorate;
    if (area) filter["branches.area"] = area;
    if (type) filter.type = type;
    if (specialty) filter.specialties = specialty;
    // لو عايز تقدر تضيف فلترة حسب insurance بعدين

    const hospitals = await Hospital.find(filter)
          .populate("specialties", "name image")
          .populate({
              path: "doctors",
              select: "name specialty gender isVerified rating profileImage",
              populate: {
                  path: "specialty",
                  select: "name",
              },
          })
      .skip((page - 1) * limit)
      .limit(limit);

    const count = await Hospital.countDocuments(filter);

    res.json({
      success: true,
      count,
      data: hospitals,
      currentPage: +page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================
// GET SINGLE HOSPITAL
// Includes: branches + doctors + specialties + images
// ============================
export const getSingleHospital = async (req, res) => {
  try {
    const { slug } = req.params;

      const hospital = await Hospital.findOne({slug})
          .populate("specialties", "name image")
          .populate({
              path: "doctors",
              select: "name specialty gender isVerified rating profileImage slogan ratingAverage",
              populate: {
                  path: "specialty",
                  select: "name",
              },
          });
    if (!hospital) {
      return res.status(404).json({ success: false, message: "Hospital not found" });
    }

    // حساب متوسط تقييم المستشفى من الدكاترة
    let doctorIds = hospital.doctors.map((d) => d._id);

    const ratingData = await Review.aggregate([
      { $match: { doctor: { $in: doctorIds } } },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } }
    ]);

    const averageRating = ratingData.length > 0 ? ratingData[0].avgRating : 0;

    res.json({
      success: true,
      data: {
        ...hospital._doc,
        averageRating,
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================
// UPDATE HOSPITAL
// ============================
export const updateHospital = async (req, res) => {
  try {
    const { id } = req.params;
    const hospital = await Hospital.findByIdAndUpdate(id, req.body, { new: true });

    if (!hospital) {
      return res.status(404).json({ success: false, message: "Hospital not found" });
    }

    res.json({ success: true, data: hospital });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================
// DELETE HOSPITAL
// ============================
export const deleteHospital = async (req, res) => {
  try {
    const { id } = req.params;
    const hospital = await Hospital.findByIdAndDelete(id);

    if (!hospital) {
      return res.status(404).json({ success: false, message: "Hospital not found" });
    }

    res.json({ success: true, message: "Hospital deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================
// BRANCHES
// ============================
export const addBranch = async (req, res) => {
  try {
    const { id } = req.params;

    const hospital = await Hospital.findById(id);
    if (!hospital) return res.status(404).json({ success: false, message: "Hospital not found" });

    hospital.branches.push(req.body);
    await hospital.save();

    res.json({ success: true, data: hospital.branches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBranch = async (req, res) => {
  try {
    const { id, branchId } = req.params;

    const hospital = await Hospital.findById(id);
    if (!hospital) return res.status(404).json({ success: false, message: "Hospital not found" });

    const branch = hospital.branches.id(branchId);
    if (!branch) return res.status(404).json({ success: false, message: "Branch not found" });

    Object.assign(branch, req.body);
    await hospital.save();

    res.json({ success: true, data: branch });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBranch = async (req, res) => {
  try {
    const { id, branchIndex } = req.params; // هنستخدم index أو _id داخل الbranch لو موجود

    const hospital = await Hospital.findById(id);
    if (!hospital) return res.status(404).json({ success: false, message: "Hospital not found" });

    // إزالة العنصر من الـ array حسب index
    hospital.branches.splice(branchIndex, 1);

    await hospital.save();

    res.json({ success: true, message: "Branch deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ============================
// DOCTORS
// ============================
export const assignDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { doctors } = req.body; // array of doctor IDs

    const hospital = await Hospital.findById(id);
    if (!hospital)
      return res.status(404).json({ success: false, message: "Hospital not found" });

    doctors.forEach((docId) => {
      if (!hospital.doctors.includes(docId)) {
        hospital.doctors.push(docId);
      }
    });

    await hospital.save();

    res.json({ success: true, data: hospital.doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// ============================
// DOCTORS removeDoctor
// ============================ 
export const removeDoctor = async (req, res) => {
  try {
    const { id, doctorId } = req.params;

    const hospital = await Hospital.findById(id);
    if (!hospital)
      return res.status(404).json({ success: false, message: "Hospital not found" });

    // حماية ضد null
    hospital.doctors = hospital.doctors.filter((d) => d && d.toString() !== doctorId);

    await hospital.save();

    // اعمل populate بعد الحذف
    const populatedHospital = await Hospital.findById(id)
      .populate("doctors", "name specialty gender isVerified rating profileImage")
      .populate({
        path: "doctors",
        populate: { path: "specialty", select: "name" },
      });

    // تأكد من إزالة أي null من النتيجة
    const doctorsClean = populatedHospital.doctors.filter(Boolean);

    res.json({ success: true, data: doctorsClean });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// ============================
// SPECIALTIES
// ============================
export const assignSpecialty = async (req, res) => {
  try {
    const { id } = req.params;
    const { specialtyIds } = req.body; // array of IDs

    const hospital = await Hospital.findById(id);
    if (!hospital) return res.status(404).json({ success: false, message: "Hospital not found" });

    specialtyIds.forEach((sid) => {
      if (!hospital.specialties.includes(sid)) hospital.specialties.push(sid);
    });

    await hospital.save();

    const populatedHospital = await Hospital.findById(id)
      .populate("specialties", "name description");

    res.json({ success: true, data: populatedHospital.specialties.filter(Boolean) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const removeSpecialty = async (req, res) => {
  try {
    const { id, specialtyId } = req.params;

    const hospital = await Hospital.findById(id);
    if (!hospital)
      return res.status(404).json({ success: false, message: "Hospital not found" });

    // حماية ضد null
    hospital.specialties = hospital.specialties.filter(
      (s) => s && s.toString() !== specialtyId
    );

    await hospital.save();

    // Populate after remove
    const populatedHospital = await Hospital.findById(id)
      .populate("specialties", "name description");

    const specialtiesClean = populatedHospital.specialties.filter(Boolean);

    res.json({ success: true, data: specialtiesClean });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// ✅ Toggle isActive for hospital or a specific branch
export const toggleHospitalOrBranch = async (req, res) => {
  try {
    const { hospitalId, branchId } = req.params;

    // 🔹 جلب المستشفى
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ success: false, message: "Hospital not found" });
    }

    // 🔹 لو branchId موجود: toggle فرع محدد
    if (branchId) {
      const branch = hospital.branches.id(branchId);
      if (!branch) {
        return res.status(404).json({ success: false, message: "Branch not found" });
      }
      branch.isActive = !branch.isActive; // toggle الحالة
    } else {
      // 🔹 لو مفيش branchId: toggle المستشفى كلها
      hospital.isActive = !hospital.isActive;
    }

    await hospital.save();

    res.json({
      success: true,
      message: branchId
        ? `Branch isActive toggled to ${hospital.branches.id(branchId).isActive}`
        : `Hospital isActive toggled to ${hospital.isActive}`,
      data: hospital,
    });
  } catch (error) {
    console.error("Toggle error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};