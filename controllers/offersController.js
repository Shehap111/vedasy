import Offer from "../models/offers.js";

// =====================
// GET ALL OFFERS
// =====================
export const getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.find()
      .populate("doctor", "name")
      .populate("specialty", "name")
      .populate("governorate", "name");
    res.status(200).json(offers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// =====================
// GET OFFER BY SLUG
// =====================
export const getOfferBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const offer = await Offer.findOne({ slug })
      .populate("doctor")
      .populate("specialty", "name")
      .populate("governorate", "name");

    if (!offer) return res.status(404).json({ message: "Offer not found" });
    res.status(200).json(offer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// =====================
// GET ACTIVE OFFERS (FOR USERS)
// =====================
export const getActiveOffers = async (req, res) => {
  try {
    const now = new Date();
    const offers = await Offer.find({
      isActive: true,
      isVerified: true,   // ⬅️ تمت الإضافة هنا
      startDate: { $lte: now },
      endDate: { $gte: now }
    })
      .populate("doctor", "name")
      .populate("specialty", "name")
      .populate("governorate", "name");

    res.status(200).json(offers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// =====================
// CREATE OFFER
// =====================
export const createOffer = async (req, res) => {
  try {
    const data = req.body;

    // Validate dates
    if (new Date(data.endDate) <= new Date(data.startDate)) {
      return res.status(400).json({ message: "endDate must be after startDate" });
    }

    // 🔹 توليد slug من العنوان العربي
    if (data.title?.ar) {
      let baseSlug = data.title.ar.trim();
      baseSlug = baseSlug.toLowerCase().replace(/\s+/g, "-"); // استبدال المسافات بـ "-"
      baseSlug = baseSlug.replace(/[^a-zA-Z0-9\u0600-\u06FF\-]/g, ""); // إزالة أي رموز غير الحروف أو الأرقام أو عربي

      let slug = baseSlug;
      let count = 1;

      // التأكد من تفرد الـ slug في الموديل
      while (await Offer.findOne({ slug })) {
        slug = `${baseSlug}-${count}`;
        count++;
      }

      data.slug = slug;
    } else {
      return res.status(400).json({ message: "Title Arabic is required for slug generation" });
    }

    const newOffer = new Offer(data);
    await newOffer.save();

    res.status(201).json(newOffer);
  } catch (error) {
    console.error("Create offer error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



// =====================
// UPDATE OFFER
// =====================
export const updateOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Validate dates if موجودة
    if (data.startDate && data.endDate && new Date(data.endDate) <= new Date(data.startDate)) {
      return res.status(400).json({ message: "endDate must be after startDate" });
    }

    const updatedOffer = await Offer.findByIdAndUpdate(id, data, { new: true });

    if (!updatedOffer) return res.status(404).json({ message: "Offer not found" });

    res.status(200).json(updatedOffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// =====================
// DELETE OFFER
// =====================
export const deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedOffer = await Offer.findByIdAndDelete(id);

    if (!deletedOffer) return res.status(404).json({ message: "Offer not found" });

    res.status(200).json({ message: "Offer deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// =====================
// TOGGLE OFFER STATE
// =====================
export const toggleOfferState = async (req, res) => {
  try {
    const { id } = req.params;

    const offer = await Offer.findById(id);
    if (!offer) return res.status(404).json({ message: "Offer not found" });

    offer.isActive = !offer.isActive;
    await offer.save();

    res.status(200).json({ message: "Offer state updated", isActive: offer.isActive });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// VERIFY Offer
export const verifyOffer = async (req, res) => {
  try {
    const { id } = req.params;

    const offer = await Offer.findById(id);
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    // If already verified → return info only (optional)
    if (offer.isVerified === true) {
      return res.status(200).json({
        success: true,
        message: "Offer already verified",
        offer,
      });
    }

    offer.isVerified = true;
    await offer.save();

    res.status(200).json({
      success: true,
      message: "Offer verified successfully",
      offer,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
