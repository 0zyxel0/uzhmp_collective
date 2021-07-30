require("dotenv").config();
const express = require("express");
const db = require("./configs/db");
const cors = require("cors");

// Create express instance
const app = express();
// Initialize json bosy options body-parser library


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Require route API
const imageEndpoint = require("./routes/mch_images");

// CALL MIDDLEWARES

// app.use(passport.initialize());
app.use(cors());

// ENABLE API ROUTES
app.use(imageEndpoint);

// Export Modules
module.exports = {
  path: "/api",
  handler: app
};
