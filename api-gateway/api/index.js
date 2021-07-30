require("dotenv").config();
const express = require("express");
const db = require("./config/db");
const cors = require("cors");
const passport = require("passport");

// Create express instance
const app = express();
// Pass the global passport object into the configuration function
require("./config/passport")(passport);
// Initialize json bosy options body-parser library

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Require route API
const usersEndpoint = require("./routes/users");
const authsEndpoint = require("./routes/auth");
const groupsEndpoint = require("./routes/groups");
const gatewayEndpoint = require("./routes/gateway");
const { pass } = require("./config/db");

// CALL MIDDLEWARES

app.use(passport.initialize());
app.use(cors());

// ENABLE API ROUTES
app.use(usersEndpoint);
app.use(authsEndpoint);
app.use(groupsEndpoint);
app.use(gatewayEndpoint);

// Export Modules
module.exports = {
  path: "/api",
  handler: app
};
