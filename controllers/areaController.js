import Area from "../models/area.js";

// Create new area
export const createArea = async (req, res) => {
  try {
    const { governorate, name, isActive } = req.body;

    // 🔹 توليد slug من الاسم العربي
    let baseSlug = name.ar.trim();
    baseSlug = baseSlug.replace(/\s+/g, "-"); // استبدال المسافات بـ "-"
    baseSlug = baseSlug.replace(/[^a-zA-Z0-9\u0600-\u06FF\-]/g, ""); // إزالة أي رموز غير مسموح بها
    let slug = baseSlug;
    let count = 1;

    while (await Area.findOne({ slug })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    // 🔹 إنشاء الـ Area
    const area = await Area.create({
      governorate,
      name,
      slug,
      isActive
    });

    res.status(201).json({ success: true, data: area });
  } catch (error) {
    console.error("Create area error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};


// Get all areas
export const getAreas = async (req, res) => {
  try {
    const areas = await Area.find()
      .populate({
        path: "governorate",
        select: "name.en name.ar id",
      });

    res.status(200).json({ success: true, data: areas });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Get areas by governorate ID
export const getAreasByGovernorate = async (req, res) => {
  try {
    const areas = await Area.find({ governorate: req.params.govId });
    res.status(200).json({ success: true, data: areas });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update area
export const updateArea = async (req, res) => {
  try {
    const { governorate, name, isActive } = req.body;

    let updateData = { governorate, isActive };

    // 🔹 لو الاسم العربي اتغير، نحدث الـ slug
    if (name && name.ar) {
      let baseSlug = name.ar.trim();
      baseSlug = baseSlug.replace(/\s+/g, "-"); // استبدال المسافات بـ "-"
      baseSlug = baseSlug.replace(/[^a-zA-Z0-9\u0600-\u06FF\-]/g, ""); // إزالة أي رموز غير مسموح بها
      let slug = baseSlug;
      let count = 1;

      while (await Area.findOne({ slug, _id: { $ne: req.params.id } })) {
        slug = `${baseSlug}-${count}`;
        count++;
      }

      updateData.name = name;
      updateData.slug = slug;
    } else if (name) {
      updateData.name = name;
    }

    const area = await Area.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!area)
      return res.status(404).json({ success: false, message: "Area not found" });

    res.status(200).json({ success: true, data: area });
  } catch (error) {
    console.error("Update area error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};


// Delete area
export const deleteArea = async (req, res) => {
  try {
    const area = await Area.findByIdAndDelete(req.params.id);
    if (!area)
      return res.status(404).json({ success: false, message: "Area not found" });
    res.status(200).json({ success: true, message: "Area deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle active status
export const toggleAreaStatus = async (req, res) => {
  try {
    const area = await Area.findById(req.params.id);
    if (!area)
      return res.status(404).json({ success: false, message: "Area not found" });
    area.isActive = !area.isActive;
    await area.save();
    res.status(200).json({ success: true, data: area });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ✅ Get area by ID
export const getAreaById = async (req, res) => {
  try {
    const { id } = req.params;

    const area = await Area.findById(id).populate({
      path: "governorate",
      select: "name.en name.ar", // بيجيب اسم المحافظة فقط باللغتين
    });

    if (!area) {
      return res.status(404).json({
        success: false,
        message: "Area not found",
      });
    }

    res.status(200).json({
      success: true,
      data: area,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
