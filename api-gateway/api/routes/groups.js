// Initalize Libraries
const passport = require("passport");
const { Router } = require("express");

// Initialize Middlewares
const { checkToken } = require("../middleware/checkTokenExist");
const { checkGroupNameExist } = require("../middleware/checkGroupExist");
// Create Instance
const router = new Router();

// Initialize controllers
const groupController = require("../controllers/v1/groupController");

// GET Requests

// POST Requests
router.post("/v1/groups/add/members", [checkToken,checkGroupNameExist], groupController.addGroupMembers);

// Export modules
module.exports = router;
