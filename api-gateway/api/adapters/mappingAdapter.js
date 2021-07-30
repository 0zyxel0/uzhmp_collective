const axios = require("axios");
const Joi = require("joi");
const logger = require("../logger");
const UserSchema = require("../models/User");
const UserProfileSchema = require("../models/UserProfile");
require("dotenv").config();
// Proxy Requests to different service endpoints

// Endpoints Controller for the Mapping Service Endpoint

// GET ALL Available Markers
module.exports.getAllMapMarker = function(req, res) {
  console.log(`[INFO] Requesting All Map Markers Data.`);
  axios
    .get(`${process.env.MAP_SRV_API}/api/v1/map/markers`)
    .then(function(response) {
      return res.send(response.data);
    })
    .catch(function(err) {
      logger.error(err.message);
      return res.status(500).json({ error: err.message });
    });
};

module.exports.getMarkerDetails = function(req, res) {
  logger.info(`[getMarkerDetails] Requesting Marker Details.`);

  let markerid = req.params.id;
  axios
    .get(`${process.env.MAP_SRV_API}/api/v1/map/marker/detail?id=${markerid}`)
    .then(function(response) {
      return res.send(response.data);
    })
    .catch(function(err) {
      console.log(`[ERROR] ${err.message}`);
      return res.status(500).json({ error: err.message });
    });
};

/**
 * @param {String} loc_type -  Defines the enum value of the point or polygon
 * @param {Number} lat -  Defines the location value of the point or polygon
 * @param {Number} long -  Defines the location value of the point or polygon
 * @param {String} title -  Defines the title value  of the point or polygon
 * @param {String} subtitle -  Defines the subtitle value of the point or polygon
 * @param {String} description -  Defines the Additional description  of the point or polygon
 * @param {String} aid -  Defines the userid from JWT
 */

module.exports.createMapMarker = async function(req, res) {
  // Validation
  const MarkerValidation = Joi.object({
    lat: Joi.number().required(),
    long: Joi.number().required(),
    title: Joi.string().required(),
    subtitle: Joi.string().required(),
    geo_type: Joi.string().required(),
    description: Joi.string().required()
  });

  const isValidated = MarkerValidation.validate({
    lat: req.body.lat,
    long: req.body.long,
    title: req.body.title,
    subtitle: req.body.subtitle,
    geo_type: req.body.geo_type,
    description: req.body.description
  });

  if (isValidated.error != null) {
    logger.info(
      `[createMapMarker] ${JSON.stringify(isValidated.error.details)}`
    );
    return res.status(404).json(isValidated.error.details);
  }

  logger.info(`[createMapMarker] Creating New Map Marker.`);

  let payloadData = {
    aid: req.user.aid,
    lat: isValidated.value.lat,
    long: isValidated.value.long,
    title: isValidated.value.title,
    subtitle: isValidated.value.subtitle,
    geo_type: isValidated.value.geo_type,
    description: isValidated.value.description,
    tags: req.body.tags,
    image_url: req.body.image_url
  };
  try {
    let mapCreatedResponse = await axios.post(
      `${process.env.MAP_SRV_API}/api/v1/map/marker`,
      payloadData
    );
    if (mapCreatedResponse) {
      logger.info(`[createMapMarker] Successfully created new Quest Marker`);
      logger.info(
        `[incrementUserScore] Updating User ${payloadData.aid} Score`
      );

      logger.info(
        `[incrementUserScore] Retreiving User Profile ${payloadData.aid}`
      );
      let userProfile = await UserSchema.findOne({ aid: payloadData.aid });
      logger.info(
        `[incrementUserScore] Updating User ${payloadData.aid} Score`
      );
      let userScore = await UserProfileSchema.updateOne(
        { profileid: userProfile.profileid },
        { $inc: { score: 1 } },
        { new: true }
      );
      logger.info(
        `[incrementUserScore] Successfully updated user ${payloadData.aid} score`
      );
      return res.status(200).json(mapCreatedResponse.data);
    }
  } catch (err) {
    logger.error(`[createMapMarker] ${err.message}`);
    return res.status(500).json({ error: err.message });
  }
};

module.exports.updateMapMarker = function(req, res) {
  logger.info(`[updateMapMarker] Update Map Marker ${req.body.mid}.`);

  // Validation
  const MarkerValidation = Joi.object({
    mid: Joi.string().required(),
    title: Joi.string().required(),
    subtitle: Joi.string().required(),
    description: Joi.string().required()
  });

  const isValidated = MarkerValidation.validate({
    mid: req.body.mid,
    title: req.body.title,
    subtitle: req.body.subtitle,
    description: req.body.description
  });

  if (isValidated.error != null) {
    console.log(`[ERROR] ${JSON.stringify(isValidated.error.details)}`);
    return res.status(404).json(isValidated.error.details);
  }

  let prx_body = {
    aid: req.user.aid,
    mid: isValidated.value.mid,
    title: isValidated.value.title,
    subtitle: isValidated.value.subtitle,
    description: isValidated.value.description,
    comments: req.body.comments,
    tags: req.body.tags,
    isActive: req.body.isActive
  };

  axios
    .put(`${process.env.MAP_SRV_API}/api/v1/map/marker`, prx_body)
    .then(function(response) {
      logger.info(
        `[updateMapMarker] Successfully UPDATED ${req.body.markerid}.`
      );
      return res.send(response.data);
    })
    .catch(function(err) {
      logger.error(`[updateMapMarker] ${err.message}`);
      return res.status(500).json({ error: err.message });
    });
};

module.exports.removeMapMarker = function(req, res) {
  let markerid = req.params.id;
  logger.info(`[removeMapMarker] DELETING Map Marker ${markerid}.`);

  axios
    .delete(`${process.env.MAP_SRV_API}/api/v1/map/marker/${markerid}`)
    .then(function(response) {
      console.log(
        `[SUCCESS] Successfully DELETED ${markerid} from the Database.`
      );
      return res.send(response.data);
    })
    .catch(function(err) {
      console.log(`[ERROR] ${err.message}`);
      return res.status(500).json({ error: err.message });
    });
};

module.exports.verifyingQuests = async function(req, res) {
  // Validation
  const MarkerValidation = Joi.object({
    markerid: Joi.string().required(),
    description: Joi.string().required(),
    aid: Joi.string().required()
  });

  const isValidated = MarkerValidation.validate({
    markerid: req.body.markerid,
    description: req.body.description,
    aid: req.user.aid
  });

  if (isValidated.error != null) {
    logger.info(
      `[verifyingQuests] ${JSON.stringify(isValidated.error.details)}`
    );
    return res.status(404).json(isValidated.error.details);
  }

  const payloadVal = {
    aid: isValidated.value.aid,
    markerid: isValidated.value.markerid,
    image_url: req.body.image_url,
    description: isValidated.value.description
  };

  try {
    let verifiedMarker = await axios.put(
      `${process.env.MAP_SRV_API}/api/v1/map/marker/quest`,
      payloadVal
    );
    if (verifiedMarker) {
      logger.info(
        `[verifyingQuests] Successfully Verified ${req.body.markerid}.`
      );

      logger.info(
        `[incrementUserScore] Updating User ${isValidated.value.aid} Score`
      );

      logger.info(
        `[incrementUserScore] Retreiving User Profile ${isValidated.value.aid}`
      );
      let userProfile = await UserSchema.findOne({
        aid: isValidated.value.aid
      });
      logger.info(
        `[incrementUserScore] Updating User ${isValidated.value.aid} Score`
      );
      let userScore = await UserProfileSchema.updateOne(
        { profileid: userProfile.profileid },
        { $inc: { score: 1 } },
        { new: true }
      );
      logger.info(
        `[incrementUserScore] Successfully updated user ${isValidated.value.aid} score`
      );

      return res.status(200).json(verifiedMarker.data);
    }
  } catch (err) {
    logger.error(`[verifyingQuests] Error in Verifiying Quest Process`);
    logger.error(err.message);
    return res.status(500).json(err);
  }
};

module.exports.getUnverifiedQuests = function(req, res) {
  logger.info(`[getUnverifiedQuests] Requesting Open Quest List`);
  axios
    .get(`${process.env.MAP_SRV_API}/api/v1/map/marker/unverified/open`)
    .then(response => {
      logger.info(`[getUnverifiedQuests] Successfully Retrieved Data`);
      logger.info(JSON.stringify(response.data));
      return res.status(200).json(response.data);
    })
    .catch(err => {
      logger.error(`[getUnverifiedQuests] ${err.message}`);
      return res.status(500).json(response.data);
    });
};

module.exports.createDevOsmChangesetUpload = function(req, res) {
  // Validation
  const MarkerValidation = Joi.object({
    mid: Joi.string().required(),
    comment: Joi.string().required(),
    nodeid: Joi.string().required(),
    lon: Joi.number().required(),
    lat: Joi.number().required(),
    version: Joi.string().required()
  });

  const isValidated = MarkerValidation.validate({
    mid: req.body.mid,
    comment: req.body.comment,
    nodeid: req.body.nodeid,
    lon: req.body.lon,
    lat: req.body.lat,
    version: req.body.version
  });

  if (isValidated.error != null) {
    logger.error(
      `[createDevOsmChangeSetId] ${JSON.stringify(isValidated.error.details)}`
    );
    return res.status(404).json(isValidated.error.details);
  }
  logger.info(`[createDevOsmChangeSetId] Requesting Change Set Creation`);
  let payload = {
    mid: isValidated.value.mid,
    createdby: req.user.aid,
    comment: isValidated.value.comment,
    nodeid: isValidated.value.nodeid,
    tags: req.body.tags,
    lon: isValidated.value.lon,
    lat: isValidated.value.lat,
    version: isValidated.value.version
  };

  axios
    .post(
      `${process.env.MAP_SRV_API}/api/v1/process/osm/dev/changeset`,
      payload
    )
    .then(response => {
      logger.info(
        `[createDevOsmChangeSetId] Successfully Created Changeset ID`
      );
      logger.info(JSON.stringify(response.data));
      return res.status(200).json(response.data);
    })
    .catch(err => {
      logger.error(`[createDevOsmChangeSetId] ${err.message}`);
      return res.status(500).json(err.message);
    });
};

module.exports.createProdOsmChangesetUpload = function(req, res) {
  // Validation
  const MarkerValidation = Joi.object({
    mid: Joi.string().required(),
    comment: Joi.string().required(),
    nodeid: Joi.string().required(),
    lon: Joi.number().required(),
    lat: Joi.number().required(),
    version: Joi.string().required()
  });

  const isValidated = MarkerValidation.validate({
    mid: req.body.mid,
    comment: req.body.comment,
    nodeid: req.body.nodeid,
    lon: req.body.lon,
    lat: req.body.lat,
    version: req.body.version
  });

  if (isValidated.error != null) {
    logger.error(
      `[createDevOsmChangeSetId] ${JSON.stringify(isValidated.error.details)}`
    );
    return res.status(404).json(isValidated.error.details);
  }
  logger.info(`[createDevOsmChangeSetId] Requesting Change Set Creation`);
  let payload = {
    mid: isValidated.value.mid,
    createdby: req.user.aid,
    comment: isValidated.value.comment,
    nodeid: isValidated.value.nodeid,
    tags: req.body.tags,
    lon: isValidated.value.lon,
    lat: isValidated.value.lat,
    version: isValidated.value.version
  };

  axios
    .post(
      `${process.env.MAP_SRV_API}/api/v1/process/osm/dev/changeset`,
      payload
    )
    .then(response => {
      logger.info(
        `[createDevOsmChangeSetId] Successfully Created Changeset ID`
      );
      logger.info(JSON.stringify(response.data));
      return res.status(200).json(response.data);
    })
    .catch(err => {
      logger.error(`[createDevOsmChangeSetId] ${err.message}`);
      return res.status(500).json(response.data);
    });
};

module.exports.getVerifiedQuestMarkers = async function(req, res) {
  logger.info(`[getVerifiedQuestMarkers] Request Verified Quest List`);

  await axios
    .get(`${process.env.MAP_SRV_API}/api/v1/map/marker/verified/quests`)
    .then(response => {
      logger.info(
        `[getVerifiedQuestMarkers] Successfully Retrieved Verified Quest List`
      );
      return res.status(200).json(response.data);
    })
    .catch(err => {
      logger.error(`[getVerifiedQuestMarkers]`);
      logger.error(err.message);
      return res.status(500).json(err.message);
    });
};

module.exports.getPossibleMarkerDuplicates = async function(req, res) {
  // Validation
  const MarkerValidation = Joi.object({
    lat: Joi.number().required(),
    long: Joi.number().required()
  });

  const isValidated = MarkerValidation.validate({
    lat: req.body.lat,
    long: req.body.long
  });

  if (isValidated.error != null) {
    logger.error(JSON.stringify(isValidated.error.details));
    return res.status(404).json(isValidated.error.details);
  }

  // Check possible duplicated Markers
  try {
    logger.info(
      `[getPossibleMarkerDuplicates] Request Possible Marker Duplicates`
    );
    let payload = { lat: isValidated.value.lat, long: isValidated.value.long };
    await axios
      .post(
        `${process.env.MAP_SRV_API}/api/v1/map/marker/checkSurrounding`,
        payload
      )
      .then(response => {
        logger.info(
          `[getPossibleMarkerDuplicates] Successfully Retrived Marker List`
        );
        logger.info(`[getPossibleMarkerDuplicates] ${response.data}`);
        return res.status(200).json(response.data);
      })
      .catch(err => {
        logger.error(`[getPossibleMarkerDuplicates] Error in Retriving Data`);
        logger.error(`[getPossibleMarkerDuplicates] ${err.message}`);
        return res.status(500).json(err.message);
      });
  } catch (err) {
    logger.error(`[getPossibleMarkerDuplicates] Error in Retriving Data`);
    logger.error(`[getPossibleMarkerDuplicates] ${err.message}`);
    return res.status(500).json(err.message);
  }
};

// Get all markers active and inactive
module.exports.getAllCreatedMarkers = function(req, res) {
  axios
    .get(`${process.env.MAP_SRV_API}/api/v1/map/marker/listAllMarkers`)
    .then(response => {
      logger.info(`[getAllCreatedMarkers] Successfully Retrived Marker List`);
      logger.info(`[getAllCreatedMarkers] ${response.data}`);
      return res.status(200).json(response.data);
    })
    .catch(err => {
      logger.error(`[getAllCreatedMarkers] Error in Retriving Data`);
      logger.error(`[getAllCreatedMarkers] ${err.message}`);
      return res.status(500).json(err.message);
    });
};

// Get All Inactive Markers
// Get all markers active and inactive
module.exports.getAllInactiveMarkers = function(req, res) {
  axios
    .get(`${process.env.MAP_SRV_API}/api/v1/map/marker/listAllInactive`)
    .then(response => {
      logger.info(`[getAllInactiveMarkers] Successfully Retrived Marker List`);
      logger.info(`[getAllInactiveMarkers] ${response.data}`);
      return res.status(200).json(response.data);
    })
    .catch(err => {
      logger.error(`[getAllInactiveMarkers] Error in Retriving Data`);
      logger.error(`[getAllInactiveMarkers] ${err.message}`);
      return res.status(500).json(err.message);
    });
};

// Update Marker Status
module.exports.updateMarkerStatus = function(req, res) {
  // Validation
  const MarkerValidation = Joi.object({
    mid: Joi.string().required(),
    isActive: Joi.boolean().required()
  });

  const isValidated = MarkerValidation.validate({
    mid: req.body.mid,
    isActive: req.body.isActive
  });

  if (isValidated.error != null) {
    logger.error(JSON.stringify(isValidated.error.details));
    return res.status(404).json(isValidated.error.details);
  }

  // Update Marker Status
  try {
    let updateVal = {
      aid: req.user.aid,
      mid: isValidated.value.mid,
      isActive: isValidated.value.isActive
    };
    axios
      .put(
        `${process.env.MAP_SRV_API}/api/v1/map/marker/questStatus`,
        updateVal
      )
      .then(response => {
        logger.info(`[updateMarkerStatus] Successfully Updated Marker Status`);
        return res.status(201).json(response.data);
      });
  } catch (err) {
    logger.error(`[updateMarkerStatus] Error in Retriving Data`);
    logger.error(`[updateMarkerStatus] ${err.message}`);
    return res.status(500).json(err.message);
  }
};

module.exports.getUserSubmittedMarkers = function(req, res) {
  // This function fetches the markers submitted by the user

  // Validation
  const MarkerValidation = Joi.object({
    aid: Joi.string().required()
  });

  const isValidated = MarkerValidation.validate({
    aid: req.params.aid
  });

  if (isValidated.error != null) {
    logger.error(JSON.stringify(isValidated.error.details));
    return res.status(404).json(isValidated.error.details);
  }

  try {
    logger.info(
      `[getUserSubmittedMarkers] Requesting Markers Submitted by User ${isValidated.value.aid}`
    );
    axios
      .get(
        `${process.env.MAP_SRV_API}/api/v1/map/marker/user/submissions/${isValidated.value.aid}`
      )
      .then(response => {
        logger.info(
          `[getUserSubmittedMarkers] Successfully Updated Marker Status`
        );
        return res.status(201).json(response.data);
      });
  } catch (err) {
    logger.error(`[getUserSubmittedMarkers] Error in Retriving Data`);
    logger.error(`[getUserSubmittedMarkers] ${err.message}`);
    return res.status(500).json(err.message);
  }
};

module.exports.createNowOSMNodeDEV = async function(req, res) {
  // Validation
  const MarkerValidation = Joi.object({
    mid: Joi.string().required(),
    comment: Joi.string().required(),
    lon: Joi.number().required(),
    lat: Joi.number().required()
  });

  const isValidated = MarkerValidation.validate({
    mid: req.body.mid,
    comment: req.body.comment,
    lon: req.body.lon,
    lat: req.body.lat
  });

  if (isValidated.error != null) {
    logger.error(JSON.stringify(isValidated.error.details));
    return res.status(404).json(isValidated.error.details);
  }

  try {
    let payload = {
      mid: isValidated.value.mid,
      comment: isValidated.value.comment,
      lon: isValidated.value.lon,
      lat: isValidated.value.lat,
      tags: req.body.tags
    };
    logger.info(`[createNowOSMNodeDEV] Request Creation of New OSM Node Marker`);
    logger.info(JSON.stringify(payload));
    let payloadResult = await axios.post(
      `${process.env.MAP_SRV_API}/api/v1/process/osm/dev/create/changeset`,
      payload
    );
    if (payloadResult.data) {
      logger.info(
        `[createNowOSMNodeDEV] Successfully Created OSM Marker in Development Environment`
      );
      return res.status(200).json(payloadResult.data);
    }
  } catch (err) {
    logger.error(
      `[createNowOSMNodeDEV] Error in Requesting OSM Marker Creation Process.`
    );
    logger.error(`[createNowOSMNodeDEV] ${err.message}`);
    return res.status(500).json(err.message);
  }
};

module.exports.createNowOSMNodePROD = async function(req, res) {
  // Validation
  const MarkerValidation = Joi.object({
    mid: Joi.string().required(),
    comment: Joi.string().required(),
    lon: Joi.number().required(),
    lat: Joi.number().required()
  });

  const isValidated = MarkerValidation.validate({
    mid: req.body.mid,
    comment: req.body.comment,
    lon: req.body.lon,
    lat: req.body.lat
  });

  if (isValidated.error != null) {
    logger.error(JSON.stringify(isValidated.error.details));
    return res.status(404).json(isValidated.error.details);
  }

  try {
    let payload = {
      mid: isValidated.value.mid,
      comment: isValidated.value.comment,
      lon: isValidated.value.lon,
      lat: isValidated.value.lat,
      tags: req.body.tags
    };
    logger.info(`[createNowOSMNodePROD] Request Creation of New OSM Node Marker`);
    logger.info(JSON.stringify(payload));
    let payloadResult = await axios.post(
      `${process.env.MAP_SRV_API}/api/v1/process/osm/prod/create/changeset`,
      payload
    );
    if (payloadResult.data) {
      logger.info(
        `[createNowOSMNodePROD] Successfully Created OSM Marker in Development Environment`
      );
      return res.status(200).json(payloadResult.data);
    }
  } catch (err) {
    logger.error(
      `[createNowOSMNodePROD] Error in Requesting OSM Marker Creation Process.`
    );
    logger.error(`[createNowOSMNode] ${err.message}`);
    return res.status(500).json(err.message);
  }
};
