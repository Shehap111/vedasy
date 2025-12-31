import Review from "../models/review.js";
import Doctor from "../models/doctor.js";
import Appointment from "../models/appointment.js";

// Create Review
export const createReview = async (req, res) => {
  try {
    const { doctor, appointmentId, rating, visitType, reviewerName, comment } = req.body;

    // تحقق من الحجز
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found." });
    }

    if (appointment.hasReview) {
      return res.status(400).json({ success: false, message: "Review already submitted for this appointment." });
    }

    // تحقق من صحة التقييم
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5." });
    }

    // إنشاء الريفيو
    const review = await Review.create({ doctor, rating, visitType, reviewerName, comment });

    // تحديث الحجز
    appointment.hasReview = true;
    await appointment.save();

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Get all reviews
export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().populate("doctor", "fullName title");
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get reviews by doctor
// Get reviews by doctor (optionally filter by visitType)
export const getReviewsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { visitType } = req.query; 

    let filter = { doctor: doctorId };
    if (visitType) {
      filter.visitType = visitType;
    }

    const reviews = await Review.find(filter);
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

