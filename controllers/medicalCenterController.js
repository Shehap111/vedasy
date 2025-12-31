import MedicalCenter from '../models/MedicalCenter.js';

// CREATE
export const createMedicalCenter = async (req, res) => {
  try {
    const center = await MedicalCenter.create(req.body);

    res.status(201).json({
      success: true,
      data: center,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL
export const getMedicalCenters = async (req, res) => {
  try {
    const { type, isActive } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (isActive !== undefined) filter.isActive = isActive;

    const centers = await MedicalCenter.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: centers.length,
      data: centers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ONE
export const getMedicalCenterById = async (req, res) => {
  try {
    const center = await MedicalCenter.findById(req.params.id);

    if (!center) {
      return res.status(404).json({
        success: false,
        message: 'Medical center not found',
      });
    }

    res.json({
      success: true,
      data: center,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE
export const updateMedicalCenter = async (req, res) => {
  try {
    const center = await MedicalCenter.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!center) {
      return res.status(404).json({
        success: false,
        message: 'Medical center not found',
      });
    }

    res.json({
      success: true,
      data: center,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// TOGGLE STATUS
export const toggleMedicalCenterStatus = async (req, res) => {
  try {
    const center = await MedicalCenter.findById(req.params.id);

    if (!center) {
      return res.status(404).json({
        success: false,
        message: 'Medical center not found',
      });
    }

    center.isActive = !center.isActive;
    await center.save();

    res.json({
      success: true,
      data: center,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE
export const deleteMedicalCenter = async (req, res) => {
  try {
    const center = await MedicalCenter.findByIdAndDelete(req.params.id);

    if (!center) {
      return res.status(404).json({
        success: false,
        message: 'Medical center not found',
      });
    }

    res.json({
      success: true,
      message: 'Medical center deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
