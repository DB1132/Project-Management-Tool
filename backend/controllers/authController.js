const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generatetoken");

// =======================
// REGISTER USER
// =======================
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = generateToken(newUser._id);

    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({ user: { id: newUser._id, name: newUser.name, email: newUser.email } });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error registering user" });
  }
};

// =======================
// LOGIN USER
// =======================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isPasswordMatch = await bcrypt.compare(password, existingUser.password);

    if (!isPasswordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateToken(existingUser._id);

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ user: { id: existingUser._id, name: existingUser.name, email: existingUser.email } });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error logging in" });
  }
};

// =======================
// LOGOUT USER
// =======================
const logoutUser = (req, res) => {
  res.clearCookie("jwt");
  return res.status(200).json({ message: "Logged out successfully" });
};

// =======================
// GET ME
// =======================
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports = { registerUser, loginUser, logoutUser, getMe };
