const jwt = require("jsonwebtoken");
require("dotenv").config();

const authmiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ error: "No authorization header provided" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Access denied" });
  }

  try {
    const secretKey = process.env.JSON_SECRET_KEY;
    const decoded = jwt.verify(token, secretKey);

    req.userId = decoded.authId;
  } catch (error) {
    console.log(error);
    return res.status(403).json({ message: "Invalid Token" });
  }
  next();
};

module.exports = authmiddleware;
