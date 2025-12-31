// controllers/appointmentsController.js
import Appointment from "../models/appointment.js";
import Clinic from "../models/clinic.js";
import HospitalClinic from "../models/HospitalClinic.js";
import sendWhatsAppMessage from "../utils/sendWhatsAppMessage.js"; // فانكشن ترسل واتساب
import mongoose from "mongoose";

// Create Appointment
export const createAppointment = async (req, res) => {
  try {
    const { clinicId, hospitalClinicId, patient, patientName, patientPhone, date, time, doctor } = req.body;

    let clinic;
    if (clinicId) {
      clinic = await Clinic.findById(clinicId);
      if (!clinic) return res.status(404).json({ message: "Clinic not found" });
    } else if (hospitalClinicId) {
      clinic = await HospitalClinic.findById(hospitalClinicId);
      if (!clinic) return res.status(404).json({ message: "HospitalClinic not found" });
    } else {
      return res.status(400).json({ message: "clinicId or hospitalClinicId is required" });
    }

    const slotStart = new Date(`${date}T${time}`);

    // تحقق من عدم وجود حجز بنفس الوقت
    const existing = await Appointment.findOne({
      $or: [
        { clinic: clinicId || null },
        { hospitalClinic: hospitalClinicId || null }
      ],
      slotStart,
      status: "booked"
    });
    if (existing) return res.status(400).json({ message: "This slot is already booked" });

    const appointment = await Appointment.create({
      clinic: clinicId || null,
      hospitalClinic: hospitalClinicId || null,
      patient: patient || null,
      patientName,
      patientPhone,
      doctor,
      slotStart,
      slotEnd: new Date(slotStart.getTime() + (clinic.appointmentDuration || 30) * 60000),
      status: "booked",
      createdByGuest: !patient
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update Appointment Status
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["booked", "cancelled", "completed", "no-show"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    appointment.status = status;
    await appointment.save();

    res.json({ success: true, appointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// Cancel Appointment
export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    appointment.status = "cancelled";
    await appointment.save();

    // إرسال رسالة للدكتور
    const clinic = await Clinic.findById(appointment.clinic);

    // TODO: الجزء ده محتاج تكمّل رسالة الواتساب
    // await sendWhatsAppMessage(clinic.doctorPhone, `Patient ${appointment.patientName} has cancelled the appointment on ${appointment.slotStart.toISOString()}`);

    res.json({ message: "Appointment cancelled successfully", appointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Appointments by Clinic
export const getAppointmentsByClinic = async (req, res) => {
  try {
    const { clinicId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(clinicId))
      return res.status(400).json({ message: "Invalid clinic ID" });

const appointments = await Appointment.find({ clinic: clinicId })
  .populate({ path: "patient", select: "name phone", model: "Client" }) // صححنا الاسم هنا
  .sort({ createdAt: -1 });

res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// Get Appointments by Patient
export const getAppointmentsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(patientId))
      return res.status(400).json({ message: "Invalid patient ID" });

    const appointments = await Appointment.find({ patient: patientId })
      .populate("clinic", "title address")
      .populate({
        path: "doctor",
        select: "name specialty",
        populate: { path: "specialty", select: "name" } // جوا الدكتور
      })
      .populate("patient", "name phone") // لو محتاج اسم ورقم المريض
      .sort({ createdAt: -1 });

    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Appointment by ID
export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid appointment ID" });

    const appointment = await Appointment.findById(id)
      .populate("clinic", "title address")
      .populate({
        path: "doctor",
        select: "name specialty",
        populate: { path: "specialty", select: "name" } // جوا الدكتور
      })
      .populate("patient", "name phone"); 

    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};




export const getAvailableSlots = async (req, res) => {
  try {
    const { clinicId, hospitalClinicId } = req.params;
    let clinic;

    if (clinicId) {
      clinic = await Clinic.findById(clinicId);
      if (!clinic) return res.status(404).json({ message: "Clinic not found" });
    } else if (hospitalClinicId) {
      clinic = await HospitalClinic.findById(hospitalClinicId);
      if (!clinic) return res.status(404).json({ message: "HospitalClinic not found" });
    } else {
      return res.status(400).json({ message: "clinicId or hospitalClinicId is required" });
    }

    const duration = clinic.appointmentDuration || 30; // مدة الحجز بالدقائق
    const result = {};
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const d = new Date(today.getTime() + i * 86400000);
      const dateStr = d.toISOString().slice(0, 10);
      const dayIndex = d.getDay(); // 0 = Sunday

      let workingHours = null;

      if (clinic.workingHours) {
        // Clinic العادية
        const dayName = dateDayName(dateStr);
        workingHours = clinic.workingHours.find(w => w.day === dayName && w.from && w.to);
      } else if (clinic.schedule) {
        // HospitalClinic
        workingHours = clinic.schedule[dayIndex];
        if (!workingHours || !workingHours.from || !workingHours.to) workingHours = null;
      }

      if (!workingHours) {
        result[dateStr] = [];
        continue;
      }

      // توليد المواعيد
      const slots = [];
      const [hoursFrom, minutesFrom] = workingHours.from.split(':').map(Number);
      const [hoursTo, minutesTo] = workingHours.to.split(':').map(Number);

      let current = new Date(dateStr);
      current.setHours(hoursFrom, minutesFrom, 0, 0);

      const end = new Date(dateStr);
      end.setHours(hoursTo, minutesTo, 0, 0);

      while (current < end) {
        slots.push(new Date(current));
        current = new Date(current.getTime() + duration * 60000);
      }

      // استبعاد المواعيد المحجوزة
      const booked = await Appointment.find({
        $or: [
          { clinic: clinicId || null },
          { hospitalClinic: hospitalClinicId || null }
        ],
        slotStart: {
          $gte: new Date(dateStr + "T00:00:00"),
          $lt: new Date(dateStr + "T23:59:59")
        },
        status: "booked"
      });

      const bookedTimes = booked.map(a => a.slotStart.getTime());
      const availableSlots = slots.filter(s => !bookedTimes.includes(s.getTime()));

      // صياغة النتائج بصيغة YYYY-MM-DDTHH:mm
      result[dateStr] = availableSlots.map(s => {
        const d = new Date(s);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      });
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// دالة مساعدة لتحويل التاريخ لاسم اليوم (Clinic العادية)
function dateDayName(dateStr) {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[new Date(dateStr).getDay()];
}
