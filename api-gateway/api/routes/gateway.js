require("dotenv").config();
// Initalize Libraries
const { Router } = require("express");

// Initialize Middleware
const { checkToken } = require("../middleware/checkTokenExist");
const { isAdminRole} = require("../middleware/isAdminRole");
// Create Instance
const router = new Router();
const Multer = require("multer");

// Limit Files to be maximum of 5MB
const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// Initialize Adapter Files
const mappingAdapter = require("../adapters/mappingAdapter");
const imgAdapter = require("../adapters/imageAdapter");

// Image Service endpoints

// Upload Single Image
router.post("/v1/apg/imsrv/s",[multer.single("file"), checkToken],imgAdapter.uploadSingleImage);
// Upload Multiple Images
router.post("/v1/apg/imsrv/m",[multer.array("photos", 5), checkToken],imgAdapter.uploadMultiImage);
// Get Image list
router.get("/v1/apg/imsrv", checkToken, imgAdapter.getImageList);
// Get Image Details
router.get("/v1/apg/imsrv/res/:id", checkToken, imgAdapter.getImageDetails);
// Delete Image that User has Uploaded
router.put("/v1/apg/imsrv/res", checkToken, imgAdapter.removeImageResource);

// Mapping Service Endpoints
// Get All Available Markers
router.get("/v1/apg/msrv/list", checkToken, mappingAdapter.getAllMapMarker);
// Get Marker Details
router.get("/v1/apg/msrv/marker/:id",checkToken,mappingAdapter.getMarkerDetails);
// Add Map Markers
router.post("/v1/apg/msrv/marker", checkToken, mappingAdapter.createMapMarker);
// Update Map Marker
router.put("/v1/apg/msrv/marker", checkToken, mappingAdapter.updateMapMarker);
// Delete Map Marker
router.delete("/v1/apg/msrv/marker/:id",checkToken,mappingAdapter.removeMapMarker);

// Get All Created Map Markers
router.get("/v1/apg/msrv/marker/listAllCreatedMarkers",checkToken,mappingAdapter.getAllCreatedMarkers);
// Get Inactive Map Markers
router.get("/v1/apg/msrv/marker/listAllDisabledMarkers",checkToken,mappingAdapter.getAllInactiveMarkers);

// Get Verified Map Markers
router.get("/v1/apg/msrv/verified/markers",checkToken,mappingAdapter.getVerifiedQuestMarkers);
// Get Unverified Map Markers
router.get("/v1/apg/msrv/open/markers",checkToken,mappingAdapter.getUnverifiedQuests);

// Verify Map Markers
router.put("/v1/apg/msrv/marker/quest",checkToken,mappingAdapter.verifyingQuests);

// Check Possible Marker Duplicates
router.post("/v1/apg/msrv/check/marker/duplicates",checkToken,mappingAdapter.getPossibleMarkerDuplicates);

// Update the Marker Status to Active or Deactivate
router.post("/v1/apg/msrv/status/marker/update",checkToken,mappingAdapter.updateMarkerStatus);

// Getting Markers submitted by User
router.get("/v1/apg/msrv/submitted/markers/:aid",checkToken,mappingAdapter.getUserSubmittedMarkers);

// OSM FUNCTIONS

// Create a New Node in OSM 
router.post("/v1/apg/msrv/osm/dev/node/create",[checkToken, isAdminRole],mappingAdapter.createNowOSMNodeDEV);
router.post("/v1/apg/msrv/osm/prod/node/create",[checkToken, isAdminRole],mappingAdapter.createNowOSMNodePROD);

// Modify a Changeset in OSM
router.post("/v1/apg/msrv/marker/dev/uploadChangeset",checkToken,mappingAdapter.createDevOsmChangesetUpload);
router.post("/v1/apg/msrv/marker/prod/uploadChangeset",checkToken,mappingAdapter.createProdOsmChangesetUpload);
// Export modules
module.exports = router;
