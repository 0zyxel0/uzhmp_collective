require("dotenv").config();
// This Middleware verifies the token passed is true or not.
const jwt = require("jsonwebtoken");
const PUB_KEY = process.env.AUTH_PUB_KEY.replace(/\\n/g, "\n");
module.exports.checkToken = function(req, res, next) {
  const authHeader = req.headers["authorization"];
  // Get only the part of the payload after the Bearer word
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.status(401).json({
      success: false,
      message: "Invalid Token Provided or Token has already Expired."
    });
  }

  if (!PUB_KEY) {
    return res.status(500).json({ error: "Identification key not found" });
  }

  jwt.verify(token, PUB_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: "Invalid Token Provided or Token has already Expired.",
        error: err.message
      });
    }
    req.user = user;
    next();
  });
};
