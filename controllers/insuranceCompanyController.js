import InsuranceCompany from "../models/InsuranceCompanys.js";

// ✅ Get all (admin) → 
export const getAllInsuranceCompaniesAdmin  = async (req, res) => {
  try {
    const companies = await InsuranceCompany.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: companies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get active (public) → 
export const getActiveInsuranceCompanies = async (req, res) => {
  try {
    const companies = await InsuranceCompany.find({ status: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: companies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get single insurance company by ID
export const getInsuranceCompanyById = async (req, res) => {
  try {
    const company = await InsuranceCompany.findById(req.params.id);
    if (!company)
      return res
        .status(404)
        .json({ success: false, message: "Insurance company not found" });

    res.status(200).json({ success: true, data: company });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Create new insurance company
export const createInsuranceCompany = async (req, res) => {
  try {
    const { name, logo, description } = req.body;

    const existing = await InsuranceCompany.findOne({ name });
    if (existing)
      return res
        .status(400)
        .json({ success: false, message: "Company already exists" });

    const company = await InsuranceCompany.create({
      name,
      logo,
      description,
    });

    res.status(201).json({ success: true, data: company });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update insurance company
export const updateInsuranceCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await InsuranceCompany.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Company not found" });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Delete insurance company
export const deleteInsuranceCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await InsuranceCompany.findByIdAndDelete(id);
    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Company not found" });

    res.status(200).json({ success: true, message: "Company deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Toggle status (active/inactive)
export const toggleInsuranceCompanyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await InsuranceCompany.findById(id);
    if (!company)
      return res
        .status(404)
        .json({ success: false, message: "Company not found" });

    company.status = !company.status;
    await company.save();

    res.status(200).json({ success: true, data: company });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
