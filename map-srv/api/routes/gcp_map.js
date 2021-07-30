const { resolvePreset } = require("@babel/core");
const { Router } = require("express");

const router = Router();

// Initialize Controller
const mapController = require("../controllers/mapController");

// Get All Map Markers
router.get("/v1/map/markers", mapController.getMapMarkers);
// Get Details of Map Marker
router.get("/v1/map/marker/detail", mapController.getMapMarkerDetails);
// Add Map Markers
router.post("/v1/map/marker", mapController.createMapMarker);
// Update Map Marker
router.put("/v1/map/marker", mapController.updateMapMarker);
// Delete Map Marker
router.delete("/v1/map/marker/:id", mapController.removeMapMarker);
// Verify quest
router.put("/v1/map/marker/quest", mapController.verifyQuest);

// Get Verified Quests Map Markers
router.get("/v1/map/marker/verified/quests",mapController.getVerfiedMarkerQuests);

// Get Unverified Map Markers
router.get("/v1/map/marker/unverified/open",mapController.getUnverifiedMarkers);

// Get Markers Near Specific Marker
router.post("/v1/map/marker/checkSurrounding", mapController.getTentativeDuplicateMarkers);

// Update Marker isActive status
router.put("/v1/map/marker/questStatus", mapController.updateQuestMarkerStatus);


// Get All Markers Created
router.get("/v1/map/marker/listAllMarkers",mapController.getAllCreatedMarkers);

// Get Inactive Markers
router.get("/v1/map/marker/listAllInactive",mapController.getAllInactiveMarkers);

router.get("/v1/map/marker/user/submissions/:aid", mapController.getUserMarkerSubmissions);


// OSM FUNCTIONS
router.post("/v1/process/osm/dev/create/changeset", mapController.createNewOsmNodeMarkerDEV);
router.post("/v1/process/osm/prod/create/changeset", mapController.createNewOsmNodeMarkerPROD);

router.post("/v1/process/osm/dev/changeset", mapController.createChangesetRequestDEV);
router.post("/v1/process/osm/prod/changeset", mapController.createChangesetRequestPROD);
router.post("/v1/node/status",mapController.getOsmNodeDetailsDEV);

module.exports = router;
