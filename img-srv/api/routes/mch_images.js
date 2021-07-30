// Initalize Libraries
const { Router } = require("express");
const Multer = require("multer");
// Importing Middlewares

// Limit Files to be maximum of 5MB
const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

// Create Instance
const router = new Router();

// Initialize controllers
const imageController = require("../controllers/imageController");

//------ Get Routes --------

// HealthCheck EndPoint
// A Valid Authentication JWT is Required
router.get("/v1/upsrv/health", imageController.testEndpoint);

router.post("/v1/upsrv/s",multer.single("file"),imageController.singleFileUploader);
// The multi endpoint might not be useful when using with an api gateway
router.post("/v1/upsrv/m",multer.array("photos", 5), imageController.multiFileUploader);

// Get All Images Available in the Database
// A Valid Authentication JWT is Required

router.get("/v1/upsrv/list", imageController.getImageList);

// Get Details on one Image Upload Entry
router.get("/v1/upsrv/:id", imageController.getImageDetails);

// Get User Uploaded Image List
router.get("/v1/upsrv/user/:id", imageController.getMyImageList);

// Delete Image that the user has uploaded
router.put("/v1/upsrv/res/del", imageController.deleteImageRecord);

// Export modules
module.exports = router;
