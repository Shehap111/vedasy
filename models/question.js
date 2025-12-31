import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const questionSchema = new mongoose.Schema(
  {
    specialty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Specialty",
      required: true,
    },

    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: false, // عشان لو Anonymous
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    answers: [answerSchema], // array of doctor answers
    gender: {
      type: String,
      enum: ["male", "female"], // محدود بالقيمتين فقط
      required: false, 
    },
    age: {
      type: Number,
      required: false, 
    },    
    isAnswered: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Question", questionSchema);
