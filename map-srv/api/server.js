require("dotenv").config();
const express = require("express");
const db = require("./config/db");
const cors = require("cors");

// Create express instance
const app = express();
// Initialize json bosy options body-parser library

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Require route API
const gcpmapping = require("./routes/gcp_map");

// CALL MIDDLEWARES

app.use(cors());

// ENABLE API ROUTES
app.use(gcpmapping);

// Export Modules
module.exports = {
  path: "/api",
  handler: app
};
