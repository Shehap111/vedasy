import Client from "../models/client.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import axios from "axios";
import fs from "fs";
import path from "path";
// ✅ Create new client
export const registerClient = async (req, res) => {
  try {
    const { name, email, password, phone, birthday ,avatarUrl ,governorate ,area } = req.body;

    const existing = await Client.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newClient = await Client.create({
      name,
      email,
      phone,
      birthday,
      password: hashedPassword,
      avatarUrl,
      governorate,
      area,
    });

    res.status(201).json(newClient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Login client
export const loginClient = async (req, res) => {
  try {
    const { email, password } = req.body;
    const client = await Client.findOne({ email });

    if (!client) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, client.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: client._id, role: "client" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // حذف الباسورد من الرد
    const { password: pwd, ...userWithoutPassword } = client._doc;

    res.status(200).json({
      success: true,
      token,
      user: userWithoutPassword, 
      message: "Login successful",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ✅ Update client profile
export const updateClientProfile = async (req, res) => {
  try {
    const clientId = req.user.id;

    // 🧩 الحقول المسموح بتعديلها فقط
    const allowedUpdates = [
      "name",
      "email",
      "phone",
      "birthday",
      "insurance",
      "avatarUrl",
      "governorate",
      "area",
    ];

    // 🧹 نفلتر البيانات اللي جاية من الريكويست
    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    // 🚫 لو مفيش أي حقل مسموح بالتعديل
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update",
      });
    }

    // 🔍 تحديث المستخدم
    const updatedClient = await Client.findByIdAndUpdate(
      clientId,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate("governorate", "name")
      .populate("area", "name");

    if (!updatedClient) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 🔒 إزالة الباسورد من الرد
    const { password, ...userWithoutPassword } = updatedClient._doc;

    res.status(200).json({
      success: true,
      user: userWithoutPassword,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating profile",
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const client = await Client.findById(req.user.id);
    if (!client) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, client.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    client.password = hashedPassword;
    await client.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// ✅ Get profile
export const getClientProfile = async (req, res) => {
  try {
    const client = await Client.findById(req.user.id)
      .select("-password")
      .populate("favourites")
      .populate("bookings");

    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update points
export const updatePoints = async (req, res) => {
  try {
    const { points } = req.body;
    const client = await Client.findByIdAndUpdate(
      req.user.id,
      { $inc: { points } },
      { new: true }
    );

    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Manage cart
export const addToCart = async (req, res) => {
  try {
    const { medicineId, quantity, price } = req.body;

    const client = await Client.findById(req.user.id);
    const existingItem = client.cart.find(
      (item) => item.medicineId.toString() === medicineId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      client.cart.push({ medicineId, quantity, price });
    }

    await client.save();
    res.status(200).json(client.cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { medicineId } = req.params;
    const client = await Client.findById(req.user.id);

    client.cart = client.cart.filter(
      (item) => item.medicineId.toString() !== medicineId
    );

    await client.save();
    res.status(200).json(client.cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ✅ Login or Register with Google
export const loginWithGoogle = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Missing Google token" });

    // Verify token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // تعديل حجم الصورة لو موجودة
    const avatarUrlOriginal = picture ? picture.replace("s96-c", "s200-c") : null;
    let avatarUrlLocal = null;

    if (avatarUrlOriginal) {
      try {
        // تحميل الصورة
        const response = await axios.get(avatarUrlOriginal, { responseType: "arraybuffer" });
        const buffer = Buffer.from(response.data, "binary");
        
        // حفظها في public folder
        const avatarsDir = path.join(process.cwd(), "public", "avatars");
        if (!fs.existsSync(avatarsDir)) fs.mkdirSync(avatarsDir, { recursive: true });
        
        const filePath = path.join(avatarsDir, `${email}.jpg`);
        fs.writeFileSync(filePath, buffer);

        avatarUrlLocal = `/avatars/${email}.jpg`;
      } catch (err) {
        console.error("Failed to download Google avatar:", err);
        avatarUrlLocal = null;
      }
    }

    // Check if client exists
    let user = await Client.findOne({ email });

    if (!user) {
      // Create new client
      user = await Client.create({
        name,
        email,
        avatarUrl: avatarUrlLocal || "/default-avatar.png",
        provider: "google",
        isGoogleUser: true,
        isActive: false,
      });
    }

    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      success: true,
      token: jwtToken,
      user,
      message: "Google login successful",
    });
  } catch (error) {
    console.error("Google Login Error:", error);
    res.status(500).json({ message: "Failed to login with Google" });
  }
};

// ✅ Login or Register with Facebook
export const loginWithFacebook = async (req, res) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) return res.status(400).json({ message: "Missing Facebook token" });

    // Get user info from Facebook API
    const fbResponse = await axios.get(
      `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`
    );

    const { email, name, picture } = fbResponse.data;
    if (!email) return res.status(400).json({ message: "Facebook account has no email" });

    // Check if client exists
    let user = await Client.findOne({ email });

    if (!user) {
      user = await Client.create({
        name,
        email,
        avatarUrl: picture?.data?.url,
        provider: "facebook",
        isFacebookUser: true,
        isActive: true,
      });
    }

    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      success: true,
      token: jwtToken,
      user,
      message: "Facebook login successful",
    });
  } catch (error) {
    console.error("Facebook Login Error:", error);
    res.status(500).json({ message: "Failed to login with Facebook" });
  }
};