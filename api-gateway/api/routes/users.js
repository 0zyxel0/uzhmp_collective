// Initalize Libraries
const passport = require("passport");
const { Router } = require("express");

// Importing Middlewares

const { checkUserRole } = require("../middleware/checkUserRole");
const { isAdminRole } = require("../middleware/isAdminRole");
const { checkToken } = require("../middleware/checkTokenExist");
const { checkRolePermission } = require("../middleware/checkRolePermission");
// Create Instance
const router = new Router();

// Initialize controllers
const userController = require("../controllers/v1/userController");
const userControllerv2 = require("../controllers/v2/userController");

// Get Routes

// HealthCheck EndPoint
router.get("/v1/user/healthcheck",passport.authenticate("jwt", { session: false }),(req, res, next) => {return res.status(200).end("Alive!");
  }
);

// User Endpoints Version 1
router.get("/v1/users",[passport.authenticate("jwt", { session: false }),checkUserRole,isAdminRole],userController.getUsers);
router.get("/v1/user/profile",passport.authenticate("jwt", { session: false }),userController.getUserProfileDetails);
router.put("/v1/user/profile/pic",passport.authenticate("jwt", { session: false }),userController.updateUserProfileImg);
router.put("/v1/user/profile",[passport.authenticate("jwt", { session: false }), checkUserRole], userController.updateUserProfile);


// User Endpoints Version 2
router.get("/v2/user/list",[checkToken,checkRolePermission],userControllerv2.getUsersList);
router.get("/v2/user/profile",checkToken,userControllerv2.getCurrentUserProfileDetails);
router.get("/v2/user/profile/details/:id",checkToken,userControllerv2.viewUserProfileDetails);

router.post("/v2/users/profile/score/add", checkToken, userControllerv2.incrementingUserScore);

router.put("/v2/user/profile/pic",checkToken,userControllerv2.updateUserProfileImg);
// Update User Profile
router.put("/v2/user/profile",checkToken, userControllerv2.updateUserProfile);

router.put("/v2/user/profile/activate",[checkToken,isAdminRole],userControllerv2.activateUserProfile);
router.put("/v2/user/profile/deactivate",[checkToken,isAdminRole],userControllerv2.deactivateUserProfile);

router.put("/v2/user/profile/promote",[checkToken,isAdminRole],userControllerv2.updateUserRoleAdmin);

router.put("/v2/user/profile/tobasic",[checkToken,isAdminRole],userControllerv2.updateUserRoleBasic);


// OSM Environment Server Settings
router.put("/v2/osm/site/settings/update",[checkToken,isAdminRole],userControllerv2.changeOsmEnvironment);
router.get("/v2/osm/site/settings",checkToken, userControllerv2.checkOsmEnvironment);


// Export modules
module.exports = router;
