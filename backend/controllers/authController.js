const User = require("../models/User");
const AppError = require("../utils/AppError");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const catchAsync = require("../utils/catchAsync");
const util = require("util");

// Compare password
const verifyPassword = async (candidatePassword, userPassword) => {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Create JWT
const signToken = (id, role, name, email, admissionStatus) => {
  return jwt.sign(
    { id, role, name, email, admissionStatus },
    process.env.JWT_KEY,
    { expiresIn: "90d" }
  );
};

exports.signToken = signToken;

// Login
exports.login = catchAsync(async (req, res, next) => {
  console.log("📩 Incoming Login Request:", JSON.stringify(req.body, null, 2));

  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Cannot leave email or password blank"));
  }

  const user = await User.findOne({ email });

  console.log("👤 User Found:", JSON.stringify(user, null, 2));

  if (!user) return next(new AppError("User not found", 404));


  const isPasswordValid = await verifyPassword(password, user.password);

  if (!isPasswordValid) {
    return next(new AppError("Enter the correct password"));
  }

  const token = signToken(
    user._id,
    user.roles,
    user.name,
    user.email,
    user.admissionStatus
  );

  user.password = undefined;

  res.status(200).json({
    status: "SUCCESS",
    message: "Login successful",
    token,
    data: { user },
  });
});

// Update password
exports.updatePassword = catchAsync(async (req, res, next) => {
  const { password, newPassword, newPasswordConfirm } = req.body;

  const user = await User.findById(req.user.id).select("+password");

  if (!(await verifyPassword(password, user.password))) {
    return next(new AppError("Enter correct password"));
  }

  if (newPassword !== newPasswordConfirm) {
    return next(new AppError("Passwords do not match", 400));
  }

  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;
  await user.save({ runValidators: true });

  const token = signToken(
    user._id,
    user.roles,
    user.name,
    user.email,
    user.admissionStatus
  );

  res.status(200).json({
    status: "SUCCESS",
    message: "Password changed",
    token,
  });
});

// Verify token
exports.verifyToken = catchAsync(async (req, res, next) => {
  let token = "";

  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("You are not logged in to gain access"));
  }

  const decoded = await util.promisify(jwt.verify)(token, process.env.JWT_KEY);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError("User belonging to this token no longer exists"));
  }

  req.user = currentUser;
  req.user.role = currentUser.roles;
  next();
});
