const nodemailer = require("nodemailer");
const UserPreference = require("../../models/preference.model");
const User = require("../../models/user.model");
const EmailVerification = require("../../models/email.model");
const { query, validationResult } = require("express-validator");
const { verifyEmailHTML } = require("../../utils/emailTemplates");

const CLIENT_URL = process.env.CLIENT_URL;
const EMAIL_SERVICE = process.env.EMAIL_SERVICE;

const verifyEmailValidation = [
  query("email").isEmail().normalizeEmail(),
  query("code").isLength({ min: 5, max: 5 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  },
];

const sendVerificationEmail = async (req, res) => {
  const USER = process.env.EMAIL;
  const PASS = process.env.PASSWORD;
  const { email, name } = req.body;
  const isConsentGiven = JSON.parse(req.body.isConsentGiven);

  const validServices = ["Gmail", "Zoho", "Outlook", "Yahoo", "SendGrid", "Mailgun"];
  const isValidService = validServices.includes(EMAIL_SERVICE);

  if (!USER || !PASS || !EMAIL_SERVICE || !isValidService) {
    if (isConsentGiven) {
      console.error(`Email verification is required for Context-Based Authentication, but email configuration is incomplete or invalid. EMAIL_SERVICE: "${EMAIL_SERVICE}".`);
      return res.status(500).json({
        message: "Email verification is required for Context-Based Authentication. Please contact support to configure email service.",
      });
    }
    
    console.warn(`Email configuration incomplete or invalid. EMAIL_SERVICE: "${EMAIL_SERVICE}". Skipping verification email.`);
    return res.status(201).json({
      message: "User registered successfully (email verification disabled)",
    });
  }

  const verificationCode = Math.floor(10000 + Math.random() * 90000);
  const verificationLink = `${CLIENT_URL}/auth/verify?code=${verificationCode}&email=${email}`;

  try {
    let transporter = nodemailer.createTransport({
      service: EMAIL_SERVICE,
      auth: {
        user: USER,
        pass: PASS,
      },
    });

    let info = await transporter.sendMail({
      from: `"SocialEcho" <${USER}>`,
      to: email,
      subject: "Verify your email address",
      html: verifyEmailHTML(name, verificationLink, verificationCode),
    });

    const newVerification = new EmailVerification({
      email,
      verificationCode,
      messageId: info.messageId,
      for: "signup",
    });

    await newVerification.save();

    res.status(200).json({
      message: `Verification email was successfully sent to ${email}`,
    });
  } catch (err) {
    console.error("Error sending verification email:", err.message);
    console.error("EMAIL_SERVICE:", EMAIL_SERVICE);
    console.error("USER (EMAIL):", USER ? "***configured***" : "NOT SET");
    console.error("PASS:", PASS ? "***configured***" : "NOT SET");
    res.status(500).json({ 
      message: "Could not send verification email",
      error: err.message 
    });
  }
};

const verifyEmail = async (req, res, next) => {
  const { code, email } = req.query;

  try {
    const [isVerified, verification] = await Promise.all([
      User.findOne({ email: { $eq: email }, isEmailVerified: true }),
      EmailVerification.findOne({
        email: { $eq: email },
        verificationCode: { $eq: code },
      }),
    ]);

    if (isVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    if (!verification) {
      return res
        .status(400)
        .json({ message: "Verification code is invalid or has expired" });
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: { $eq: email } },
      { isEmailVerified: true },
      { new: true }
    ).exec();

    await Promise.all([
      EmailVerification.deleteMany({ email: { $eq: email } }).exec(),
      new UserPreference({
        user: updatedUser,
        enableContextBasedAuth: true,
      }).save(),
    ]);

    req.userId = updatedUser._id;
    req.email = updatedUser.email;
    next();
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  sendVerificationEmail,
  verifyEmail,
  verifyEmailValidation,
};
