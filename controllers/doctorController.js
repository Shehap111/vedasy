import Doctor from "../models/doctor.js";
import bcrypt from "bcryptjs";
import slugify from "slugify";
import clinic from "../models/clinic.js";

// ✅ Create new doctor
export const createDoctor = async (req, res) => {
  try {
    const {
      name,          // { en, ar }
      slogan,        // { en, ar }
      description,   // { en, ar }
      email,
      phone,
      password,
      gender,
      specialty,
      subSpecialty,
      degrees,       // { en, ar }
      experienceYears,
      profileImage,
      clinics,
      insuranceCompanies,
    } = req.body;

    // 🔹 التحقق من وجود ايميل مسبق
    const existingEmail = await Doctor.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    // 🔹 التحقق من وجود رقم تليفون مسبق
    const existingPhone = await Doctor.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ success: false, message: "Phone number already exists" });
    }

// بدلاً من استخدام slugify
let baseSlug = name.ar.trim(); // خليه زي ما هو بالعربي
// لو في مسافات أو رموز عايز تستبدلها بـ "-":
baseSlug = baseSlug.replace(/\s+/g, "-");
let slug = baseSlug;
let count = 1;

while (await Doctor.findOne({ slug })) {
  slug = `${baseSlug}-${count}`;
  count++;
}

    // 🔹 تشفير الباسورد
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔹 إنشاء الدكتور
    const doctor = await Doctor.create({
      name,
      slug,
      slogan,
      description,
      email,
      phone,
      password: hashedPassword,
      gender,
      specialty,
      subSpecialty,
      degrees,
      experienceYears,
      profileImage,
      clinics,
      insuranceCompanies,
    });

    res.status(201).json({ success: true, data: doctor });
  } catch (error) {
    console.error("Create doctor error:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ✅ Public: Get verified & active doctors only
export const getPublicDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isVerified: true, isActive: true })
      .populate("specialty", "name")
      .populate("subSpecialty", "name")
      .populate({
        path: "clinics",
        populate: [
          { path: "governorate", select: "name id" },
          { path: "area", select: "name id" }
        ]
      })
      .populate("insuranceCompanies", "name");

    res.status(200).json({ success: true, data: doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};


export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate("specialty", "name")
      .populate("subSpecialty", "name")
      .populate({
        path: "clinics",
        populate: [
          { path: "governorate", select: "name id" },
          { path: "area", select: "name id" }
        ]
      })
      .populate("insuranceCompanies", "name")
      .sort({ isVerified: 1 });

    res.status(200).json({ success: true, data: doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};


// ✅ Get doctor by ID
export const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findById(id)
      .populate("specialty", "name")
      .populate("subSpecialty", "name")
      .populate({
        path: "clinics",
        populate: [
          { path: "governorate", select: "name id" },
          { path: "area", select: "name id" }
        ]
      })
      .populate("insuranceCompanies", "name")

    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ✅ Get doctor by slug
export const getDoctorBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const doctor = await Doctor.findOne({ slug }) // بدل findById استخدم findOne بالـ slug
      .populate("specialty", "name")
      .populate("subSpecialty", "name")
      .populate("clinics")
      .populate("insuranceCompanies", "name");

    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};


// ✅ Update doctor (safe version)
export const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // 🔹 تشفير الباسورد لو موجود
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    // 🔹 الحصول على الدكتور الحالي
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    // 🔹 الحقول الثنائية اللغة
    const bilingualFields = ["name", "slogan", "description", "degrees"];
    bilingualFields.forEach((field) => {
      if (updates[field] && typeof updates[field] === "object") {
        doctor[field] = {
          ...doctor[field],       // الحفاظ على القيم القديمة
          ...updates[field],      // تحديث القيم الجديدة
        };
      }
    });

    // 🔹 الحقول العادية
    const normalFields = [
      "email",
      "phone",
      "gender",
      "specialty",
      "subSpecialty",
      "experienceYears",
      "profileImage",
      "clinics",
      "insuranceCompanies",
      "isActive",
      "isVerified",
    ];
    normalFields.forEach((field) => {
      if (updates[field] !== undefined) {
        doctor[field] = updates[field];
      }
    });

    // 🔹 تحديث slug لو الاسم العربي موجود
    if (doctor.name && doctor.name.ar) {
      let baseSlug = doctor.name.ar.trim().replace(/\s+/g, "-");
      let slug = baseSlug;
      let count = 1;

      while (await Doctor.findOne({ slug, _id: { $ne: id } })) {
        slug = `${baseSlug}-${count}`;
        count++;
      }

      doctor.slug = slug;
    }
    doctor.isVerified = false;
    doctor.needsVerification = true;
    await doctor.save();
    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    console.error("Update doctor error:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ✅ Toggle active status
export const toggleDoctorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    doctor.isActive = !doctor.isActive;
    await doctor.save();

    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ✅ Delete doctor
export const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findByIdAndDelete(id);

    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    res.status(200).json({ success: true, message: "Doctor deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

export const verifyDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findById(id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    doctor.isVerified = true;
    doctor.needsVerification = false;

    await doctor.save();
    res.status(200).json({ success: true, data: doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
