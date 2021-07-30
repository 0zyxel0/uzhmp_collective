// Initalize Libraries
const passport = require("passport");
const { Router } = require("express");

// Initialize Middlewares
import { checkUserRole } from "../middleware/checkUserRole";
import { checkUserEmailExist } from "../middleware/checkUserEmailExist";
// Create Instance
const router = new Router();

// Initialize controllers
const authController = require("../controllers/v1/authController");
const authControllerv2 = require("../controllers/v2/authController");

// Get Routes

// HealthCheck EndPoint
router.get("/v1/healthcheck", (req, res, next) => {
  return res.status(200).end("Alive!");
});

// router.get(
//   "/v1/protected",
//   [passport.authenticate("jwt", { session: false }), checkUserRole],
//   authController.dashboard
// );

// POST Routes
router.post("/v1/register", checkUserEmailExist, authController.register);
router.post("/v1/login", authController.login);

router.post("/v2/register", checkUserEmailExist, authControllerv2.register);
router.post("/v2/login", authControllerv2.login);


// Export modules
module.exports = router;
