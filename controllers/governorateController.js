import Governorate from "../models/governorate.js";

// Create new governorate
export const createGovernorate = async (req, res) => {
  try {
    const { name, isActive } = req.body;

    // 🔹 توليد slug من الاسم العربي
    let baseSlug = name.ar.trim();
    baseSlug = baseSlug.replace(/\s+/g, "-"); // استبدال المسافات بـ "-"
    baseSlug = baseSlug.replace(/[^a-zA-Z0-9\u0600-\u06FF\-]/g, ""); // إزالة أي رموز غير مسموح بها
    let slug = baseSlug;
    let count = 1;

    while (await Governorate.findOne({ slug })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    // 🔹 إنشاء الـ Governorate
    const governorate = await Governorate.create({
      name,
      slug,
      isActive
    });

    res.status(201).json({ success: true, data: governorate });
  } catch (error) {
    console.error("Create governorate error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Get governorate by ID
export const getGovernorateById = async (req, res) => {
  try {
    const governorate = await Governorate.findById(req.params.id);

    if (!governorate) {
      return res.status(404).json({ success: false, message: "Governorate not found" });
    }

    res.status(200).json({ success: true, data: governorate });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


// Get all governorates
export const getGovernorates = async (req, res) => {
  try {
    const governorates = await Governorate.find();
    res.status(200).json({ success: true, data: governorates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update governorate
export const updateGovernorate = async (req, res) => {
  try {
    const { name, isActive } = req.body;

    let updateData = { isActive };

    // 🔹 لو الاسم العربي اتغير، نحدث الـ slug
    if (name && name.ar) {
      let baseSlug = name.ar.trim();
      baseSlug = baseSlug.replace(/\s+/g, "-"); // استبدال المسافات بـ "-"
      baseSlug = baseSlug.replace(/[^a-zA-Z0-9\u0600-\u06FF\-]/g, ""); // إزالة أي رموز غير مسموح بها
      let slug = baseSlug;
      let count = 1;

      while (await Governorate.findOne({ slug, _id: { $ne: req.params.id } })) {
        slug = `${baseSlug}-${count}`;
        count++;
      }

      updateData.name = name;
      updateData.slug = slug;
    } else if (name) {
      updateData.name = name;
    }

    const governorate = await Governorate.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!governorate)
      return res.status(404).json({ success: false, message: "Governorate not found" });

    res.status(200).json({ success: true, data: governorate });
  } catch (error) {
    console.error("Update governorate error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete governorate
export const deleteGovernorate = async (req, res) => {
  try {
    const governorate = await Governorate.findByIdAndDelete(req.params.id);
    if (!governorate)
      return res.status(404).json({ success: false, message: "Governorate not found" });
    res.status(200).json({ success: true, message: "Governorate deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle active status
export const toggleGovernorateStatus = async (req, res) => {
  try {
    const governorate = await Governorate.findById(req.params.id);
    if (!governorate)
      return res.status(404).json({ success: false, message: "Governorate not found" });
    governorate.isActive = !governorate.isActive;
    await governorate.save();
    res.status(200).json({ success: true, data: governorate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
