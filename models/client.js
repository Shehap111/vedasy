import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String },
    provider: { type: String, default: "local" }, // "google" or "local"
    isGoogleUser: { type: Boolean, default: false },
    avatarUrl: { type: String },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },

    // 🎂 بدل age بخاصية birthday
    birthday: { type: Date },

    // 🪙 Loyalty Points
    points: { type: Number, default: 0 },

    // 🏥 تأمين صحي
    insurance: { type: String },

    // 🏙 المحافظة والمنطقة
    governorate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Governorate",
    },
    area: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Area",
    },

    // 🛒 Pharmacy Cart
    cart: [
      {
        medicineId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Medicine",
          required: true,
        },
        quantity: { type: Number, default: 1 },
        price: { type: Number, required: true },
        addedAt: { type: Date, default: Date.now },
      },
    ],

    favourites: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    ],
    bookings: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Client", clientSchema);

