const express = require("express");
const db = require("../config/db");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const cookie = require("cookie-parser");
require("dotenv").config();

const router = express.Router();
const secretKey = process.env.JSON_SECRET_KEY;

// Signup route
router.post("/signup", (req, res) => {
  const { email, password, name } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({
      message: "username email and password are required to signup in our app",
    });
  }

  try {
    const checkUserIdSql = "SELECT email FROM user_credential WHERE email = ?";

    db.query(checkUserIdSql, [email], async (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error" });
      }
      if (result.length > 0) {
        return res.status(400).json({
          message: "Email already exists. Please enter another email address",
        });
      } else {
        const saltRounds = 10;
        const userId = uuidv4();
        const hashPassword = await bcrypt.hash(password, saltRounds);
        const sql =
          "INSERT INTO user_credential(user_id, email, password, user_name) VALUES (?, ?, ?, ?)";

        const values = [userId, email, hashPassword, name];

        db.query(sql, values, (err, result) => {
          if (err) {
            console.error("Error executing query", err);
            return res.status(500).json({ message: "Database Error" });
          }
          return res.status(201).json({
            authId: userId,
            userName: name,
          });
        });
      }
    });
  } catch (error) {
    console.error("Error hashing the password", error);
    return res.status(500).json({ message: "Error hashing password" });
  }
});

// Signin route
router.post("/signin", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const sql = "SELECT * FROM user_credential WHERE email = ?";

  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length > 0) {
      const user = results[0];
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        const token = jwt.sign(
          { authId: user.user_id, userName: user.user_name },
          secretKey,
          { expiresIn: "1h" }
        );
        res.cookie("token", token);
        return res.status(200).json({
          message: "Access granted",
          token: token,
        });
      } else {
        return res.status(401).json({ message: "Access denied" });
      }
    } else {
      return res.status(401).json({ message: "Invalid email or password" });
    }
  });
});

module.exports = router;
