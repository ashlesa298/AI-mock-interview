const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/blacklist.model");
const asyncHandler = require("../utils/asyncHandler");

function signToken(user) {
  return jwt.sign(
    { id: user._id, username: user.username, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
}

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  maxAge: 24 * 60 * 60 * 1000,
};

// REGISTER USER
const registerUserController = asyncHandler(async function (req, res) {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      message: "Please provide username, email, and password",
    });
  }

  const isUserAlreadyExists = await userModel.findOne({
    $or: [{ username }, { email }],
  });

  if (isUserAlreadyExists) {
    return res.status(400).json({
      message: "Account already exists with this username or email",
    });
  }

  const hash = await bcrypt.hash(password, 10);

  const user = await userModel.create({ username, email, password: hash });

  const token = signToken(user);

  res.cookie("token", token, cookieOptions);

  res.status(201).json({
    message: "User registered successfully",
    user: { id: user._id, username: user.username, email: user.email },
    token,
  });
});

// LOGIN USER
const loginUserController = asyncHandler(async function (req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please provide email and password" });
  }

  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = signToken(user);

  res.cookie("token", token, cookieOptions);

  res.status(200).json({
    message: "User logged in successfully",
    user: { id: user._id, username: user.username, email: user.email },
    token,
  });
});

// LOGOUT USER
const logoutUserController = asyncHandler(async function (req, res) {
  const token = req.cookies.token;

  if (token) {
    await tokenBlacklistModel.create({ token });
  }

  res.clearCookie("token");

  res.status(200).json({ message: "User logged out successfully" });
});

// GET CURRENT USER
const getMeController = asyncHandler(async function (req, res) {
  const user = await userModel.findById(req.user.id).select("-password");

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  res.status(200).json({
    message: "User details fetched successfully",
    user,
  });
});

module.exports = {
  registerUserController,
  loginUserController,
  logoutUserController,
  getMeController,
};