const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function Register(req, res) {
  const { email, password } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashpass = await bcrypt.hash(password, 10);

    // Create user but set isVerified: false initially
    const user = await prisma.user.create({
      data: { email, password: hashpass, isVerified: false },
    });

    // Generate verification token
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Email verification link
    const verificationLink = `http://localhost:3000/verify?token=${token}`;

    // Send verification email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Email Verification",
      html: `<p>Click <a href="${verificationLink}">here</a> to verify your email.</p>`,
    });

    res.status(201).json({
      message:
        "User registered successfully. Check your email for verification!",
    });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ error: "Something went wrong", details: err.message });
  }
}

async function VerifyEmail(req, res) {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Update user as verified
    await prisma.user.update({
      where: { email: decoded.email },
      data: { isVerified: true },
    });

    res.status(200).json({ message: "Email verified successfully!" });
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired token." });
  }
}

async function Login(req, res) {
  const { email, password } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      return res.status(404).json({ error: "User Doesn't Exist" });
    }

    if (!existingUser.isVerified) {
      return res.status(400).json({ error: "Please Verify Your Email" });
    }

    if (await bcrypt.compare(password, existingUser.password)) {
      const accessToken = jwt.sign(
        { userId: existingUser.id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.cookie("token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        user: {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
        },
      });
    } else {
      return res.status(401).json({ error: "Password is Incorrect" });
    }
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}

module.exports = { Login, Register, VerifyEmail };
