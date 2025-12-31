import SubSpecialty from "../models/subSpecialty.js";

// Create new sub-specialty
export const createSubSpecialty = async (req, res) => {
  try {
    const { name, description, specialty, isActive } = req.body;

    // 🔹 توليد slug من الاسم العربي
    let baseSlug = name.ar.trim();
    baseSlug = baseSlug.replace(/\s+/g, "-"); // استبدال المسافات بـ "-"
    baseSlug = baseSlug.replace(/[^a-zA-Z0-9\u0600-\u06FF\-]/g, ""); // إزالة أي رموز غير مسموح بها
    let slug = baseSlug;
    let count = 1;

    while (await SubSpecialty.findOne({ slug })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    // 🔹 إنشاء الـ SubSpecialty
    const subSpecialty = await SubSpecialty.create({
      name,
      description,
      specialty,
      slug,
      isActive
    });

    res.status(201).json({ success: true, data: subSpecialty });
  } catch (error) {
    console.error("Create sub-specialty error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};


// Get all sub-specialties
export const getSubSpecialties = async (req, res) => {
  try {
    const subSpecialties = await SubSpecialty.find()
      .populate("specialty", "name"); // هتجيب الاسم فقط من الـ specialty
    res.status(200).json({ success: true, data: subSpecialties });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Get sub-specialty by ID
export const getSubSpecialtyById = async (req, res) => {
  try {
    const { id } = req.params;

    const subSpecialty = await SubSpecialty.findById(id)
      .populate({
        path: "specialty",
        select: "name", // نختار بس الاسم
      })
      .lean(); // بيرجع object عادي مش mongoose doc (أخف وأسرع)

    if (!subSpecialty) {
      return res.status(404).json({ success: false, message: "Sub-specialty not found" });
    }

    res.status(200).json({ success: true, data: subSpecialty });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
  


// Get sub-specialties by specialty ID
export const getSubSpecialtiesBySpecialty = async (req, res) => {
  try {
    const subSpecialties = await SubSpecialty.find({ specialty: req.params.specialtyId });
    res.status(200).json({ success: true, data: subSpecialties });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update sub-specialty
export const updateSubSpecialty = async (req, res) => {
  try {
    const { name, description, specialty, isActive } = req.body;

    let updateData = { description, specialty, isActive };

    // 🔹 لو الاسم العربي اتغير، نحدث الـ slug
    if (name && name.ar) {
      let baseSlug = name.ar.trim();
      baseSlug = baseSlug.replace(/\s+/g, "-"); // استبدال المسافات بـ "-"
      baseSlug = baseSlug.replace(/[^a-zA-Z0-9\u0600-\u06FF\-]/g, ""); // إزالة أي رموز غير مسموح بها
      let slug = baseSlug;
      let count = 1;

      while (await SubSpecialty.findOne({ slug, _id: { $ne: req.params.id } })) {
        slug = `${baseSlug}-${count}`;
        count++;
      }

      updateData.name = name;
      updateData.slug = slug;
    } else if (name) {
      updateData.name = name;
    }

    const subSpecialty = await SubSpecialty.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!subSpecialty)
      return res.status(404).json({ success: false, message: "Sub-specialty not found" });

    res.status(200).json({ success: true, data: subSpecialty });
  } catch (error) {
    console.error("Update sub-specialty error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};


// Delete sub-specialty
export const deleteSubSpecialty = async (req, res) => {
  try {
    const subSpecialty = await SubSpecialty.findByIdAndDelete(req.params.id);
    if (!subSpecialty)
      return res.status(404).json({ success: false, message: "Sub-specialty not found" });
    res.status(200).json({ success: true, message: "Sub-specialty deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
