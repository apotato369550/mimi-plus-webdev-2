const mysql = require("mysql");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const QRCode = require("qrcode");
const db = require("../database/dbconn.js");

/******************************************************************
 *             Registration, Verification, Login Logic
 ******************************************************************/

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  db.query(
    "SELECT * FROM customers WHERE email = ?",
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

        db.query(
          "INSERT INTO customers (name, email, password, isVerified, verificationToken) VALUES (?, ?, ?, ?, ?)",
          [name, email, hashedPassword, 0, verificationToken],
          (err, results) => {
            if (err) {
              console.error("Insert error:", err);
              return res.status(500).json({ message: "Database error" });
            }

            const customerID = results.insertId;

            const qrData = `http://localhost:5002/user/${customerID}`;
            QRCode.toDataURL(qrData, (err, qrCodeDataUrl) => {
              if (err) {
                console.error(err);
                return res
                  .status(500)
                  .json({ message: "Error generating QR code" });
              }

              const updateQuery =
                "UPDATE customers SET qrcode = ? WHERE customerID = ?";
              db.query(updateQuery, [qrCodeDataUrl, customerID], (err) => {
                if (err) {
                  console.error(err);
                  return res
                    .status(500)
                    .json({ message: "Error saving QR code" });
                }

                const transporter = nodemailer.createTransport({
                  service: "Gmail",
                  auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                  },
                });

                const verifyURL = `http://localhost:5002/verify-email/${verificationToken}`;

                const mailOptions = {
                  from: process.env.EMAIL_USER,
                  to: email,
                  subject: "Please verify your email for Mimi+",
                  html: `<p>Click to verify: <a href="${verifyURL}">${verifyURL}</a></p>`,
                };

                transporter.sendMail(mailOptions, (err) => {
                  if (err) {
                    console.error(err);
                    return res
                      .status(500)
                      .json({ message: "Could not send verification email" });
                  }

                  res.status(201).json({
                    message:
                      "Registration successful! Check your email to verify your account.",
                    customerID: customerID,
                    qrCode: qrCodeDataUrl,
                  });
                });
              });
            });
          },
        );
      } catch (hashError) {
        console.error("Hashing error:", hashError);
        return res.status(500).json({ message: "Error hashing password" });
      }
    },
  );
};

exports.verifyEmail = (req, res) => {
  const { token } = req.params;

  db.query(
    "SELECT * FROM customers WHERE verificationToken = ? AND isVerified = 0",
    [token],
    (err, results) => {
      console.log("Token received:", token);

      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database Error" });
      }

      if (results === 0) {
        return res
          .status(500)
          .json({ message: "Invalid or expired verification link" });
      }

      db.query(
        "UPDATE customers SET isVerified = 1, verificationToken = NULL WHERE verificationToken = ?",
        [token],
        (err) => {
          if (err) {
            console.error(err);
            return res
              .status(500)
              .json({ message: "Could not verify account" });
          }

          res
            .status(500)
            .json({ message: "Email verified! you can now login" });
        },
      );
    },
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
    "SELECT * FROM customers WHERE email = ? AND isVerified = 1",
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
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const payload = {
        customerID: user.customerID,
        email: user.email,
        name: user.name,
        role: user.role,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      res.status(200).json({
        message: "Login successful!",
        customerID: user.customerID,
        token: token,
        role: user.role,
      });
    },
  );
};

exports.forgotPassword = (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  db.query(
    "SELECT * FROM customers WHERE email = ?",
    [email],
    (err, results) => {
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
        "UPDATE customers SET resetToken = ?, resetExpires = ? WHERE email = ?",
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

          const resetLink = `http://localhost:5002/reset-password/${resetToken}`;

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
    },
  );
};

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(500).json({ message: "Password is required" });
  }

  db.query(
    "SELECT * FROM customers WHERE resetToken = ? AND resetExpires > NOW()",
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
        "UPDATE customers SET password = ?, resetToken = NULL, resetExpires = NULL WHERE customerID = ?",
        [hashedPassword, user.customerID],
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
