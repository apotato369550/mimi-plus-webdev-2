
const mysql = require("mysql");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const QRCode = require("qrcode");
const db = require("../database/dbconn.js");
const { queryAsync } = require("../database/utils");

/******************************************************************
 *             Registration, Verification, Login Logic
 ******************************************************************/

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) {
        console.error("Database query error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (results.length > 0) {
        return res.status(409).json({ message: "Email already exists" });
      }

      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString("hex");

        const transporter = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        console.log("Email configuration:", {
          emailUser: process.env.EMAIL_USER,
          emailPassLength: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0
        });

        const verifyURL = `http://localhost:5173/verify-email/${verificationToken}`;

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Please verify your email for Mimi+",
          html: `<p>Click to verify: <a href="${verifyURL}">${verifyURL}</a></p>`,
        };

        console.log("Attempting to send email to:", email);
        try {
          await transporter.sendMail(mailOptions);
          console.log("Email sent successfully!");
        } catch (emailError) {
          console.error("Failed to send email:", emailError);
          throw emailError;
        }

        // Create the user after email is sent
        const randomString = crypto.randomBytes(32).toString("hex");
        const qrHash = await bcrypt.hash(randomString, 10);

        const insertResult = await queryAsync(
          "INSERT INTO users (name, email, password, isVerified, verificationToken, role, qrcode) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [name, email, hashedPassword, 0, verificationToken, "customer", qrHash]
        );

        const userID = insertResult.insertId;

        res.status(201).json({
          message: "Registration successful! Check your email to verify your account.",
          userID: userID
        });
      } catch (hashError) {
        console.error("Hashing error:", hashError);
        return res.status(500).json({ message: "Error hashing password" });
      }
    },
  );
};

exports.verifyEmail = (req, res) => {
  const { token } = req.params;

  console.log("Verifying email with token:", token);

  db.query(
    "SELECT * FROM users WHERE verificationToken = ? AND isVerified = 0",
    [token],
    (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.redirect("http://localhost:5173/verify-email");
      }

      if (results.length === 0) {
        console.log("No user found with this token or already verified");
        return res.redirect("http://localhost:5173/verify-email");
      }

      db.query(
        "UPDATE users SET isVerified = 1, verificationToken = NULL WHERE verificationToken = ?",
        [token],
        (updateErr) => {
          if (updateErr) {
            console.error("Update error:", updateErr);
            return res.redirect("http://localhost:5173/verify-email");
          }

          console.log("Email verified successfully");
          res.redirect("http://localhost:5173/verify-email");
        }
      );
    }
  );
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide email and password." });
  }

  // Find user by email
  db.query(
    "SELECT * FROM users WHERE email = ? AND isVerified = 1",
    [email],
    async (err, results) => {
      if (err) {
        console.error("DB error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (results.length === 0) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const user = results[0];
      console.log("user:", user);

      // Check if user is active
      if (user.status === 'inactive') {
        return res.status(403).json({ message: "Account is inactive. Please contact support for assistance." });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const payload = {
        userID: user.userID,
        email: user.email,
        name: user.name,
        role: user.role,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      res.status(200).json({
        message: "Login successful!",
        userID: user.userID,
        token: token,
        role: user.role,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        pointsBalance: user.pointsBalance || 0
      });
    },
  );
};

exports.forgotPassword = (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "DB error" });
    }

    if (results.length === 0) {
      return res.status(500).json({ message: "Email not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 3600000);

    db.query(
      "UPDATE users SET resetToken = ?, resetExpires = ? WHERE email = ?",
      [resetToken, resetExpires, email],
      (err, updateResults) => {
        if (err) {
          console.error(err);
          return res
            .status(500)
            .json({ message: "Could not save reset token" });
        }

        const transporter = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        // CHANGE THIS to your frontend URL and path
        const resetLink = `http://localhost:5173/resetpassword/${resetToken}`;

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Password Reset Request",
          html: `<p>Click the link to reset your password: </p><p><a href="${resetLink}">${resetLink}</a></p>`,
        };

        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: "Could not sent email" });
          }
          res
            .status(200)
            .json({ message: "Check your email to reset your password" });
        });
      },
    );
  });
};

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(500).json({ message: "Password is required" });
  }

  db.query(
    "SELECT * FROM users WHERE resetToken = ? AND resetExpires > NOW()",
    [token],
    async (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "DB error" });
      }

      if (results.length === 0) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      const user = results[0];

      const hashedPassword = await bcrypt.hash(password, 10);

      db.query(
        "UPDATE users SET password = ?, resetToken = NULL, resetExpires = NULL WHERE userID = ?",
        [hashedPassword, user.userID],
        (err, updateResults) => {
          if (err) {
            console.error(err);
            return res
              .status(500)
              .json({ message: "Could not reset password" });
          }

          res.status(200).json({ message: "Password reset successful" });
        },
      );
    },
  );
};

/******************************************************************
 *                       Get User QR Code
 ******************************************************************/

exports.getQRCode = async (req, res) => {
  try {
    const userID = req.user.userID;

    // Get the user's QR code hash from the database
    const userResult = await queryAsync(
      "SELECT qrcode FROM users WHERE userID = ?",
      [userID],
    );

    if (userResult.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const qrHash = userResult[0].qrcode;

    // Create a URL that staff can use to look up the customer
    const staffURL = `${process.env.CLIENT_URL || "http://localhost:5173"}/staff?qrHash=${qrHash}`;

    // Generate QR code as a data URL
    const qrCodeDataURL = await QRCode.toDataURL(staffURL);

    res.status(200).json({
      qrCode: qrCodeDataURL,
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    res.status(500).json({ message: "Error generating QR code" });
  }
};
