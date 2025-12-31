import Specialty from "../models/specialty.js";

// Create new specialty
// Create new specialty
export const createSpecialty = async (req, res) => {
  try {
    const { name, description, image, isActive } = req.body;

    // 🔹 توليد slug من الاسم العربي
    let baseSlug = name.ar.trim();
    baseSlug = baseSlug.replace(/\s+/g, "-"); // استبدال المسافات بـ "-"
    baseSlug = baseSlug.replace(/[^a-zA-Z0-9\u0600-\u06FF\-]/g, ""); // إزالة أي رموز غير حروف أو أرقام أو عربي
    let slug = baseSlug;
    let count = 1;

    while (await Specialty.findOne({ slug })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    // 🔹 إنشاء الـ Specialty
    const specialty = await Specialty.create({
      name,
      description,
      slug,
      image,
      isActive
    });

    res.status(201).json({ success: true, data: specialty });
  } catch (error) {
    console.error("Create specialty error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Get all specialties
export const getSpecialties = async (req, res) => {
  try {
    const specialties = await Specialty.find();
    res.status(200).json({ success: true, data: specialties });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single specialty
export const getSpecialtyById = async (req, res) => {
  try {
    const specialty = await Specialty.findById(req.params.id);
    if (!specialty)
      return res.status(404).json({ success: false, message: "Specialty not found" });
    res.status(200).json({ success: true, data: specialty });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update specialty
export const updateSpecialty = async (req, res) => {
  try {
    const { name, description, image, isActive } = req.body;

    let updateData = { description, image, isActive };

    // 🔹 لو الاسم العربي اتغير، نحدث الـ slug
    if (name && name.ar) {
      let baseSlug = name.ar.trim();
      baseSlug = baseSlug.replace(/\s+/g, "-"); // استبدال المسافات بـ "-"
      baseSlug = baseSlug.replace(/[^a-zA-Z0-9\u0600-\u06FF\-]/g, ""); // إزالة أي رموز غير مسموح بها
      let slug = baseSlug;
      let count = 1;

      while (await Specialty.findOne({ slug, _id: { $ne: req.params.id } })) {
        // $ne عشان يتجاهل نفس المستند الحالي
        slug = `${baseSlug}-${count}`;
        count++;
      }

      updateData.name = name;
      updateData.slug = slug;
    } else if (name) {
      updateData.name = name;
    }

    const specialty = await Specialty.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!specialty)
      return res.status(404).json({ success: false, message: "Specialty not found" });

    res.status(200).json({ success: true, data: specialty });
  } catch (error) {
    console.error("Update specialty error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete specialty
export const deleteSpecialty = async (req, res) => {
  try {
    const specialty = await Specialty.findByIdAndDelete(req.params.id);
    if (!specialty)
      return res.status(404).json({ success: false, message: "Specialty not found" });
    res.status(200).json({ success: true, message: "Specialty deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
