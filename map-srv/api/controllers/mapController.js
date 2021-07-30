// Import Libraries
require("dotenv").config();
const mongoose = require("mongoose");
const Joi = require("joi");
const locationSchema = require("../models/MapLocation");
const dayjs = require("dayjs");
const axios = require("axios");
const _ = require("lodash");
const logger = require("../logger");
import { response } from "express";
import { nanoid } from "nanoid";

// Get Active and Inactive Markers
module.exports.getAllCreatedMarkers = function(req, res) {
  logger.info(
    "[getAllCreatedMarkers] Initiating Request For All Active and Inactive Map Markers"
  );

  let listFilters = {
    _id: false,
    __v: false
  };

  locationSchema.find({}, listFilters, function(err, marker) {
    if (err) {
      logger.error(`[[getAllCreatedMarkers]]`);
      logger.error(err.message);
      return res.status(500).json({
        success: false,
        message: "[ERROR] Error in Initializing Connection to Database.",
        error: err.message
      });
    }
    if (!marker) {
      logger.info("[getAllCreatedMarkers] No Map Marker Records Found.");
      return res.status(404).json({
        message: "No Record Found"
      });
    }
    logger.info("[getAllCreatedMarkers] Returning Map Markers");
    logger.info(marker);
    return res.status(200).json(marker);
  });
};

// Get All Inactive Markers
module.exports.getAllInactiveMarkers = function(req, res) {
  logger.info(
    "[getAllInactiveMarkers] Initiating Request For All Active and Inactive Map Markers"
  );

  let listFilters = {
    _id: false,
    __v: false
  };

  locationSchema.find({ isActive: false }, listFilters, function(err, marker) {
    if (err) {
      logger.error(`[getAllInactiveMarkers]`);
      logger.error(err.message);
      return res.status(500).json({
        success: false,
        message: "[ERROR] Error in Initializing Connection to Database.",
        error: err.message
      });
    }
    if (!marker) {
      logger.info("[getAllInactiveMarkers] No Map Marker Records Found.");
      return res.status(404).json({
        message: "No Record Found"
      });
    }
    logger.info("[getAllInactiveMarkers] Returning Map Markers");
    logger.info(marker);
    return res.status(200).json(marker);
  });
};

// Get All Markers Available
module.exports.getMapMarkers = function(req, res) {
  logger.info(
    "[getMapMarkers] Initiating Request For All Available Map Markers"
  );

  let listFilters = {
    _id: false,
    __v: false
  };

  locationSchema.find({ isActive: true }, listFilters, function(err, marker) {
    if (err) {
      logger.error(err.message);
      return res.status(500).json({
        success: false,
        message: "[ERROR] Error in Initializing Connection to Database.",
        error: err.message
      });
    }
    if (!marker) {
      logger.info("No Map Marker Records Found.");
      return res.status(404).json({
        message: "No Record Found"
      });
    }
    logger.info("Returning Map Markers");
    logger.info(marker);
    return res.status(200).json(marker);
  });
};

// Add Marker on Map Marker with details
module.exports.createMapMarker = async function(req, res) {
  // Validation
  const MarkerValidation = Joi.object({
    lat: Joi.number().required(),
    long: Joi.number().required(),
    title: Joi.string().required(),
    subtitle: Joi.string().required(),
    geo_type: Joi.string().required(),
    description: Joi.string().required(),
    aid: Joi.string().required()
  });

  const isValidated = MarkerValidation.validate({
    lat: req.body.lat,
    long: req.body.long,
    title: req.body.title,
    subtitle: req.body.subtitle,
    geo_type: req.body.geo_type,
    description: req.body.description,
    aid: req.body.aid
  });

  if (isValidated.error != null) {
    logger.error(`[ERROR] ${JSON.stringify(isValidated.error.details)}`);
    return res.status(404).json(isValidated.error.details);
  }

  try {
    logger.info(`[createMapMarker] Creating Map Quest Marker.`);
    let genId = nanoid(21);
    let historyVal = {
      description: "Created Map Quest Marker",
      createdon: new Date(),
      changedby: isValidated.value.aid
    };
    let mapping = new locationSchema({
      mid: genId,
      location: {
        geo_type: isValidated.value.geo_type,
        coordinates: {
          lat: isValidated.value.lat,
          long: isValidated.value.long
        }
      },
      geoloc: {
        type: "Point",
        coordinates: [isValidated.value.long, isValidated.value.lat]
      },
      marker_location: [isValidated.value.lat, isValidated.value.long],
      title: isValidated.value.title,
      subtitle: isValidated.value.subtitle,
      image_url: req.body.image_url,
      history: historyVal,
      tags: req.body.tags,
      description: isValidated.value.description,
      updatedby: isValidated.value.aid
    });

    logger.info(`[createMapMarker] Adding New Map Quest Record in Database.`);
    logger.info(`[createMapMarker] ${JSON.stringify(mapping)}`);

    // Save Mongoose Record
    await mapping.save(function(err, success) {
      if (err) {
        logger.error(
          `[createMapMarker] Error in Inserting Mapping Details to Database.`
        );
        logger.error(err.message);
        return res.status(500).json({ success: false, errors: err.message });
      }
      if (!success) {
        logger.info(`Could not Insert Record to the Database.`);
        return res.status(409).json({
          success: false,
          message:
            "The Request Could not be completed due to a conflict with the currect service state."
        });
      }
      logger.info(
        `Successfully Uploaded Location Data ID of ${JSON.stringify(
          success._doc
        )}`
      );

      // Clone Mongo Response for cleaning
      let clonedResult = Object.assign({}, success._doc);
      // Clean the Cloned Object
      delete clonedResult._id;
      delete clonedResult.__v;
      return res.status(201).json(clonedResult);
    });
  } catch (err) {
    logger.error(`[createMapMarker] ${JSON.stringify(err)}`);
    return res.status(400).json(err.message);
  }
};

// Edit Map Marker
module.exports.updateMapMarker = async function(req, res) {
  // Validation
  const MarkerValidation = Joi.object({
    aid: Joi.string().required(),
    mid: Joi.string().required(),
    title: Joi.string().required(),
    subtitle: Joi.string().required(),
    description: Joi.string().required()
  });

  const isValidated = MarkerValidation.validate({
    aid: req.body.aid,
    mid: req.body.mid,
    title: req.body.title,
    subtitle: req.body.subtitle,
    description: req.body.description
  });

  if (isValidated.error != null) {
    logger.error(JSON.stringify(isValidated.error.details));
    return res.status(404).json(isValidated.error.details);
  }

  const filterVal = { mid: isValidated.value.mid };

  locationSchema.findOne(filterVal, function(err, marker) {
    if (err) {
      logger.error(`[updateMapMarker] Error in Updating Quest Marker Details.`);
      logger.error(err.message);
      return res.status(500).json({
        message: "Error saving record",
        error: err
      });
    }
    if (!marker) {
      logger.info(`[updateMapMarker] No Matching Map Marker Id ${mid} Found.`);
      return res.status(404).json({
        message: "No Record Found Matching Map ID."
      });
    }

    let historyVal = {
      description: "Updated Map Marker Record",
      createdon: dayjs(),
      changedby: isValidated.value.aid
    };

    // Initialize the Model Record Found
    marker.mid = isValidated.value.mid ? isValidated.value.mid : marker.mid;
    marker.location.geo_type = req.body.geo_type
      ? req.body.geo_type
      : marker.location.geo_type;
    marker.location.coordinates.lat = req.body.lat
      ? req.body.lat
      : marker.location.coordinates.lat;
    marker.location.coordinates.long = req.body.long
      ? req.body.long
      : marker.location.coordinates.long;
    marker.title = isValidated.value.title
      ? isValidated.value.title
      : marker.title;
    marker.subtitle = isValidated.value.subtitle
      ? isValidated.value.subtitle
      : marker.subtitle;
    marker.description = isValidated.value.description
      ? isValidated.value.description
      : marker.description;
    marker.image_url = req.body.image_url
      ? req.body.image_url
      : marker.image_url;
    marker.nodeid = req.body.nodeid ? req.body.nodeid : marker.nodeid;
    marker.version = req.body.version ? req.body.version : marker.version;
    marker.changesetid = req.body.changesetid
      ? req.body.changesetid
      : marker.changesetid;
    marker.comments = req.body.comments ? req.body.comments : marker.comments;
    marker.tags = req.body.tags ? req.body.tags : marker.tags;

    marker.history.push(historyVal);
    marker.isActive = req.body.isActive ? req.body.isActive : marker.isActive;
    marker.updatedby = isValidated.value.aid
      ? isValidated.value.aid
      : marker.updatedby;
    marker.updatedon = dayjs();

    // Save Record with updated details

    marker.save(function(err, success) {
      if (err) {
        logger.error(`[updateMapMarker] Error In Saving Updated Details`);
        logger.error(err.message);
        return res.status(500).json({
          message: "Error getting record."
        });
      }
      if (!success) {
        logger.info(`[updateMapMarker] No Matching Record ID Found `);
        return res.status(404).json({
          message: "No Matching Record ID Found"
        });
      }
      logger.info(
        `[updateMapMarker] Successfully Updated Data ${JSON.stringify(
          success._doc
        )}`
      );
      // Clone Mongo Response for cleaning
      let clonedResult = Object.assign({}, success._doc);
      // Clean the Cloned Object
      delete clonedResult._id;
      delete clonedResult.__v;
      return res.status(201).json(clonedResult);
    });
  });
};

// Delete Map Marker
module.exports.removeMapMarker = function(req, res) {
  let markerId = req.params.id;

  locationSchema.deleteOne({ mid: markerId }, function(err, success) {
    if (err) {
      logger.error(`[removeMapMarker] ${err.message}`);
      return res.status(500).json(err.message);
    }
    if (!success) {
      logger.error("[removeMapMarker] No Marker Record Found.");
      return res.status(404).json({
        message: "No Marker Record Found"
      });
    }
    logger.info(`[removeMapMarker] Deleted Marker Item ${markerId}.`);
    return res.status(200).json({ message: "Successfully Deleted Marker" });
  });
};

// Get Details of Map Marker
module.exports.getMapMarkerDetails = function(req, res) {
  let listFilters = {
    _id: false,
    __v: false
  };

  // Validation
  const markerValidation = Joi.object({
    markerid: Joi.string().required()
  });

  const isValidated = markerValidation.validate({
    markerid: req.query.id
  });

  logger.info(
    `[getMapMarkerDetails] Request Map Details : ${isValidated.value.markerid}`
  );
  locationSchema.findOne(
    { mid: isValidated.value.markerid },
    listFilters,
    function(err, marker) {
      if (err) {
        logger.error(`[getMapMarkerDetails] ${err.message}`);
        return res.status(500).json({
          success: false,
          message: "Error in Initializing Connection to Database.",
          error: err.message
        });
      }
      if (!marker) {
        logger.error("[getMapMarkerDetails] No Marker Record Found.");
        return res.status(404).json({
          message: "No Marker Record Found"
        });
      }
      logger.info(
        `[getMapMarkerDetails] Sucessfully Returning Map Details of ${JSON.stringify(
          marker
        )}.`
      );
      return res.status(200).json(marker);
    }
  );
};

// Verify Quest
module.exports.verifyQuest = function(req, res) {
  // Validation
  const MarkerValidation = Joi.object({
    markerid: Joi.string().required(),
    description: Joi.string().required(),
    updatedby: Joi.string().required()
  });

  const isValidated = MarkerValidation.validate({
    markerid: req.body.markerid,
    description: req.body.description,
    updatedby: req.body.aid
  });

  if (isValidated.error != null) {
    logger.error(`[verifyQuest] ${JSON.stringify(isValidated.error.details)}`);
    return res.status(404).json(isValidated.error.details);
  }

  const filterVal = { mid: isValidated.value.markerid };
  const payloadVal = {
    verifierid: isValidated.value.updatedby,
    image_url: req.body.image_url,
    description: isValidated.value.description,
    notes: "Quest Verified",
    createdon: dayjs()
  };

  locationSchema.findOneAndUpdate(
    filterVal,
    {
      updatedon: dayjs(),
      $push: {
        image_url: payloadVal.image_url,
        verifiers: { aid: isValidated.value.updatedby ,updatedon: dayjs() },
        history: payloadVal
      },
      $inc: {
        verifier_count: 1
      }
    },
    {
      new: true
    },
    function(err, success) {
      if (err) {
        logger.error(`[verifyQuest] ${err.message}`);
        return res.status(500).json({
          message: "Error saving record",
          error: err
        });
      }
      if (!success) {
        logger.error(`[verifyQuest] NO MATCHING ID FOUND FOR ${markerId}`);
        return res.status(404).json({
          message: "No Record Found Matching Map ID."
        });
      }
      logger.info(`[verifyQuest] Successfully Updated Record`);

      // Clone Mongo Response for cleaning
      let clonedResult = Object.assign({}, success._doc);
      // Clean the Cloned Object
      delete clonedResult._id;
      delete clonedResult.__v;
      logger.info(`[verifyQuest] ${JSON.stringify(clonedResult)}`);
      return res.status(201).json(clonedResult);
    }
  );
};

// Get Verified Marker Quests
module.exports.getVerfiedMarkerQuests = function(req, res) {
  let listFilters = {
    __v: false
  };
  logger.info(
    `[getVerfiedMarkerQuests] Requesting Open Verified Quest Markers`
  );
  locationSchema.find(
    { verifier_count: 3, isActive: true },
    listFilters,
    (err, markers) => {
      if (err) {
        logger.error(`[getVerfiedMarkerQuests] ${err.message}`);
        return res.status(404).json(err.message);
      }
      logger.info(`[getVerfiedMarkerQuests] ${JSON.stringify(markers)}`);
      return res.status(200).json(markers);
    }
  );
};

// Get Open Markers
// Markers that are not yet Verified by other users
module.exports.getUnverifiedMarkers = function(req, res) {
  let listFilters = {
    __v: false
  };
  logger.info(`[getUnverifiedMarkers] Request Open Quest Markers`);
  locationSchema.find(
    { verifier_count: { $lt: 3 }, isActive: true },
    listFilters,
    (err, markers) => {
      if (err) {
        logger.error(`[getUnverifiedMarkers] ${err.message}`);
        return res.status(404).json(err.message);
      }
      logger.info(`[getUnverifiedMarkers] ${JSON.stringify(markers)}`);
      return res.status(200).json(markers);
    }
  );
};

// Get OSM Node detail DEV OSM
module.exports.getOsmNodeDetailsDEV = function(req, res) {
  // Validation
  const NodeValidation = Joi.object({
    nodeid: Joi.string().required()
  });

  const isValidated = NodeValidation.validate({
    nodeid: req.body.nodeid
  });

  logger.info(
    `[getOsmNodeDetails] Requesting NodeId ${JSON.stringify(req.body.nodeid)}`
  );

  if (isValidated.error != null) {
    logger.error(JSON.stringify(isValidated.error.details));
    return res.status(404).json(isValidated.error.details);
  }
  try {
    axios
      .get(
        `${process.env.OSM_DEV_API}/api/0.6/node/${isValidated.value.nodeid}`,
        {},
        {
          auth: {
            username: process.env.OSM_DEV_USER,
            password: process.env.OSM_DEV_PASS
          }
        }
      )
      .then(function(response) {
        logger.info(JSON.stringify(response.data));
        return res.status(200).json(response.data);
      });
  } catch (err) {
    logger.error(err.message);
    return res.status(404).json(err.message);
  }
};

// Create New Node Details and Place a marker in OSM DEV
module.exports.createNewOsmNodeMarkerDEV = async function(req, res) {
  // Validation
  const changesetValidation = Joi.object({
    mid: Joi.string().required(),
    comment: Joi.string().required(),
    lon: Joi.number().required(),
    lat: Joi.number().required()
  });

  const isValidated = changesetValidation.validate({
    mid: req.body.mid,
    comment: req.body.comment,
    lon: req.body.lon,
    lat: req.body.lat
  });

  if (isValidated.error != null) {
    logger.error(JSON.stringify(isValidated.error.details));
    return res.status(404).json(isValidated.error.details);
  }

  // Tag Creator Function
  function parseTagsToXML(payload) {
    let parsedTags = "";
    payload.forEach(element => {
      parsedTags += `<tag k="${element.k}" v="${element.v}"/>`;
    });
    return parsedTags;
  }

  try {
    const payloadVal = {
      notes: "Quest Marker Submitted To OSM",
      createdon: dayjs()
    };

    const token = Buffer.from(
      `${process.env.OSM_DEV_USER}:${process.env.OSM_DEV_PASS}`,
      "utf8"
    ).toString("base64");

    const config = {
      headers: {
        "Content-Type": "application/xml",
        Authorization: `Basic ${token}`
      }
    };

    // globals
    let xmlTags = parseTagsToXML(req.body.tags);

    // Creating Changeset Values
    let requestChangesetCreation = `<?xml version="1.0" encoding="UTF-8"?><osm><changeset version="0.6" generator="AccessCompleteWeb"><tag k="created_by" v="AccessComplete_Web"/><tag k="comment" v="${isValidated.value.comment}"/></changeset></osm>`;

    logger.info(`[createNewNodeDetails] Requesting OSM Changeset ID `);

    let changesetid = await axios.put(
      `${process.env.OSM_DEV_API}/api/0.6/changeset/create`,
      requestChangesetCreation,
      config
    );
    logger.info(
      `[createChangesetRequestDEV] Received Changeset ID : ${changesetid.data}`
    );

    let createNodeChangeset = `<osmChange version="0.6" generator="AccessCompleteWeb"><create><node id="-3" lon="${isValidated.value.lon}" lat="${isValidated.value.lat}" version="0" changeset="${changesetid.data}"><tag k="comment" v="${isValidated.value.comment}"/>${xmlTags}</node></create><modify/><delete if-unused="true"/></osmChange>`;
    logger.info(`[createChangesetRequest] Starting Changeset Data Upload`);
    logger.info(
      `[createChangesetRequest] Sending Payload ${JSON.stringify(
        createNodeChangeset
      )}`
    );

    let finishedChangeset = await axios.post(
      `${process.env.OSM_DEV_API}/api/0.6/changeset/${changesetid.data}/upload`,
      createNodeChangeset,
      config
    );
    logger.info(
      `[createChangesetRequestDEV] Successfully Uploaded Changeset Data`
    );
    logger.info(`[createChangesetRequest] Uploaded Changeset : ${finishedChangeset.data}`);
    logger.info(`[createChangesetRequest] Closing Changeset Data Request`);
    

    let closingChangeset = await axios.put(
      `${process.env.OSM_DEV_API}/api/0.6/changeset/${changesetid.data}/close`,
      {},
      config
    );
    logger.info(
      `[createChangesetRequestDEV] Successfully Closed Changeset Data ${changesetid.data}`
    );
    logger.info(
      `[createChangesetRequestDev] Updating Quest Marker ${isValidated.value.mid} Records`
    );

    locationSchema.findOneAndUpdate(
      { mid: isValidated.value.mid },
      {
        updatedon: dayjs(),
        isActive: false,
        $push: {
          history: payloadVal
        }
      },
      function(err, success) {
        if (err) {
          logger.error(`[createChangesetRequestDEV]`);
          logger.error(err.message);
        }
        if (!success) {
          logger.error(
            `[createChangesetRequestDEV] No Matching Map Marker with ${isValidated.value.mid} Found.`
          );
        }
        logger.info(
          `[createChangesetRequestDEV] Successfully Updated ${isValidated.value.mid} Record`
        );
      }
    );

    return res.status(200).json("Successfully Submitted OSM Record");
  } catch (err) {
    logger.error(`[createNewNodeDetails] Error in Processing OSM Submission.`);
    logger.error(err.message);
    return res.status(404).json(err.message);
  }
};

// Create New Node Details and Place a marker in OSM PROD
module.exports.createNewOsmNodeMarkerPROD = async function(req, res) {
  // Validation
  const changesetValidation = Joi.object({
    mid: Joi.string().required(),
    comment: Joi.string().required(),
    lon: Joi.number().required(),
    lat: Joi.number().required()
  });

  const isValidated = changesetValidation.validate({
    mid: req.body.mid,
    comment: req.body.comment,
    lon: req.body.lon,
    lat: req.body.lat
  });

  if (isValidated.error != null) {
    logger.error(JSON.stringify(isValidated.error.details));
    return res.status(404).json(isValidated.error.details);
  }

  // Tag Creator Function
  function parseTagsToXML(payload) {
    let parsedTags = "";
    payload.forEach(element => {
      parsedTags += `<tag k="${element.k}" v="${element.v}"/>`;
    });
    return parsedTags;
  }

  try {
    const payloadVal = {
      notes: "Quest Marker Submitted To OSM",
      createdon: dayjs()
    };

    const token = Buffer.from(
      `${process.env.OSM_PROD_USER}:${process.env.OSM_PROD_PASS}`,
      "utf8"
    ).toString("base64");

    const config = {
      headers: {
        "Content-Type": "application/xml",
        Authorization: `Basic ${token}`
      }
    };

    // globals
    let xmlTags = parseTagsToXML(req.body.tags);

    // Creating Changeset Values
    let requestChangesetCreation = `<?xml version="1.0" encoding="UTF-8"?><osm><changeset version="0.6" generator="AccessCompleteWeb"><tag k="created_by" v="AccessComplete_Web"/><tag k="comment" v="${isValidated.value.comment}"/></changeset></osm>`;

    logger.info(`[createNewNodeDetails] Requesting OSM Changeset ID `);

    let changesetid = await axios.put(
      `${process.env.OSM_PROD_API}/api/0.6/changeset/create`,
      requestChangesetCreation,
      config
    );
    logger.info(
      `[createChangesetRequestDEV] Received Changeset ID : ${changesetid.data}`
    );

    let createNodeChangeset = `<osmChange version="0.6" generator="AccessCompleteWeb"><create><node id="-3" lon="${isValidated.value.lon}" lat="${isValidated.value.lat}" version="0" changeset="${changesetid.data}"><tag k="comment" v="${isValidated.value.comment}"/>${xmlTags}</node></create><modify/><delete if-unused="true"/></osmChange>`;
    logger.info(`[createChangesetRequest] Starting Changeset Data Upload`);
    logger.info(
      `[createChangesetRequest] Sending Payload ${JSON.stringify(
        createNodeChangeset
      )}`
    );

    let finishedChangeset = await axios.post(
      `${process.env.OSM_PROD_API}/api/0.6/changeset/${changesetid.data}/upload`,
      createNodeChangeset,
      config
    );
    logger.info(
      `[createChangesetRequestDEV] Successfully Uploaded Changeset Data`
    );
    logger.info(`[createChangesetRequest] Closing Changeset Data Request`);

    let closingChangeset = await axios.put(
      `${process.env.OSM_PROD_API}/api/0.6/changeset/${changesetid.data}/close`,
      {},
      config
    );
    logger.info(
      `[createChangesetRequestDEV] Successfully Closed Changeset Data ${changesetid.data}`
    );
    logger.info(
      `[createChangesetRequestDev] Updating Quest Marker ${isValidated.value.mid} Records`
    );

    locationSchema.findOneAndUpdate(
      { mid: isValidated.value.mid },
      {
        updatedon: dayjs(),
        isActive: false,
        $push: {
          history: payloadVal
        }
      },
      function(err, success) {
        if (err) {
          logger.error(`[createChangesetRequestDEV]`);
          logger.error(err.message);
        }
        if (!success) {
          logger.error(
            `[createChangesetRequestDEV] No Matching Map Marker with ${isValidated.value.mid} Found.`
          );
        }
        logger.info(
          `[createChangesetRequestDEV] Successfully Updated ${isValidated.value.mid} Record`
        );
      }
    );

    return res.status(200).json("Successfully Submitted OSM Record");
  } catch (err) {
    logger.error(`[createNewNodeDetails] Error in Processing OSM Submission.`);
    logger.error(err.message);
    return res.status(404).json(err.message);
  }
};

// Create Changeset Request to DEV OSM
module.exports.createChangesetRequestDEV = async function(req, res) {
  // Validation
  const changesetValidation = Joi.object({
    mid: Joi.string().required(),
    createdby: Joi.string().required(),
    comment: Joi.string().required(),
    nodeid: Joi.string().required(),
    lon: Joi.number().required(),
    lat: Joi.number().required(),
    version: Joi.number().required()
  });

  const isValidated = changesetValidation.validate({
    mid: req.body.mid,
    createdby: req.body.createdby,
    comment: req.body.comment,
    nodeid: req.body.nodeid,
    lon: req.body.lon,
    lat: req.body.lat,
    version: req.body.version
  });

  if (isValidated.error != null) {
    logger.error(JSON.stringify(isValidated.error.details));
    return res.status(404).json(isValidated.error.details);
  }

  // Tag Creator Function
  function parseTagsToXML(payload) {
    let parsedTags = "";
    payload.forEach(element => {
      parsedTags += `<tag k="${element.k}" v="${element.v}"/>`;
    });
    return parsedTags;
  }

  try {
    // Prepare Database Update when OSM Submission is Successfully Created.

    const payloadVal = {
      notes: "Quest Marker Submitted To OSM",
      createdon: dayjs()
    };

    const token = Buffer.from(
      `${process.env.OSM_DEV_USER}:${process.env.OSM_DEV_PASS}`,
      "utf8"
    ).toString("base64");

    const config = {
      headers: {
        "Content-Type": "application/xml",
        Authorization: `Basic ${token}`
      }
    };

    // globals
    let xmlTags = parseTagsToXML(req.body.tags);

    // Changeset Values
    // Create Changeset ID
    let changesetid = "";
    let xmlRequestChangeset = `<?xml version="1.0" encoding="UTF-8"?><osm><changeset version="0.6" generator="AccessCompleteWeb"><tag k="created_by" v="AccessComplete_Web"/><tag k="comment" v="${isValidated.value.comment}"/></changeset></osm>`;

    // return res.send(xmlChangesetData);
    logger.info(`[createChangesetRequestDEV] Requesting OSM Changeset ID `);
    logger.info(
      `[createChangesetRequestDEV] ${JSON.stringify(xmlRequestChangeset)}`
    );
    await axios
      .put(
        `${process.env.OSM_DEV_API}/api/0.6/changeset/create`,
        xmlRequestChangeset,
        config
      )
      .then(response => {
        logger.info(
          `[createChangesetRequestDEV] Received Changeset ID : ${response.data}`
        );
        changesetid = response.data;
      });

    let xmlChangesetData = `<osmChange version="0.6" generator="AccessCompleteWeb"><create/><modify><node id="${isValidated.value.nodeid}" lon="${isValidated.value.lon}" lat="${isValidated.value.lat}" version="${isValidated.value.version}" changeset="${changesetid}">${xmlTags}</node></modify><delete if-unused="true"/></osmChange>`;
    logger.info(`[createChangesetRequest] Starting Changeset Data Upload`);
    logger.info(
      `[createChangesetRequest] Sending Payload ${JSON.stringify(
        xmlChangesetData
      )}`
    );
    await axios
      .post(
        `${process.env.OSM_DEV_API}/api/0.6/changeset/${changesetid}/upload`,
        xmlChangesetData,
        config
      )
      .then(function(response) {
        logger.info(
          `[createChangesetRequestDEV] Successfully Uploaded Changeset Data`
        );
      });
    logger.info(`[createChangesetRequest] Closing Changeset Data Request`);
    await axios
      .put(
        `${process.env.OSM_DEV_API}/api/0.6/changeset/${changesetid}/close`,
        {},
        config
      )
      .then(function(response) {
        logger.info(
          `[createChangesetRequestDEV] Successfully Closed Changeset Data ${changesetid}`
        );
        logger.info(
          `[createChangesetRequestDev] Updating Quest Marker ${isValidated.value.mid} Records`
        );
        locationSchema.findOneAndUpdate(
          { mid: isValidated.value.mid },
          {
            updatedon: dayjs(),
            isActive: false,
            $push: {
              history: payloadVal
            }
          },
          function(err, success) {
            if (err) {
              logger.error(`[createChangesetRequestDEV]`);
              logger.error(err.message);
            }
            if (!success) {
              logger.error(
                `[createChangesetRequestDEV] No Matching Map Marker with ${isValidated.value.mid} Found.`
              );
            }
            logger.info(
              `[createChangesetRequestDEV] Successfully Updated ${isValidated.value.mid} Record`
            );
          }
        );

        return res
          .status(200)
          .json("Successfully Uploaded Changeset Details to OSM Server");
      });
  } catch (err) {
    logger.error(err.message);
    return res.status(404).json(err.message);
  }
};

// Upload Changeset Changes to DEV OSM
module.exports.uploadChangesetDEV = function(req, res) {
  // Validation
  const changesetValidation = Joi.object({
    nodeid: Joi.string().required(),
    lon: Joi.number().required(),
    lat: Joi.number().required(),
    markertags: Joi.string().required,
    version: Joi.number().required(),
    changesetid: Joi.string().required()
  });

  const isValidated = changesetValidation.validate({
    nodeid: req.body.nodeid,
    lon: req.body.lon,
    lat: req.body.lat,
    markertags: req.body.markertags,
    version: req.body.version,
    changesetid: req.body.changesetid
  });

  if (isValidated.error != null) {
    logger.error(JSON.stringify(isValidated.error.details));
    return res.status(404).json(isValidated.error.details);
  }

  try {
    let xmlTags = isValidated.value.markertags;

    let xmlData = `<?xml version="1.0" encoding="UTF-8"?><osmChange version="0.6" generator="iD"><create/><modify><node id="${isValidated.value.nodeid}" lon="${isValidated.value.lon}" lat="${isValidated.value.lat}" version="${isValidated.value.version}" changeset="${isValidated.value.changesetid}">${xmlTags}</node></modify><delete if-unused="true"/></osmChange>`;
    const token = Buffer.from(
      `${process.env.OSM_DEV_USER}:${process.env.OSM_DEV_PASS}`,
      "utf8"
    ).toString("base64");
    let config = {
      headers: {
        "Content-Type": "application/xml",
        Authorization: `Basic ${token}`
      }
    };
    logger.info(`[uploadChangesetDEV] - ${xmlData}`);
    axios
      .post(
        `${process.env.OSM_DEV_API}/api/0.6/changeset/${isValidated.value.changesetid}/upload`,
        xmlData,
        config
      )
      .then(function(response) {
        logger.info(JSON.stringify(response.data));
        return res.status(200).json(response.data);
      });
  } catch (err) {
    logger.error(err.message);
    return res.status(404).json(err.message);
  }
};

// Upload Changeset Changes to PROD OSM
module.exports.createChangesetRequestPROD = async function(req, res) {
  // Validation
  const changesetValidation = Joi.object({
    mid: Joi.string().required(),
    createdby: Joi.string().required(),
    comment: Joi.string().required(),
    nodeid: Joi.string().required(),
    lon: Joi.number().required(),
    lat: Joi.number().required(),
    version: Joi.number().required()
  });

  const isValidated = changesetValidation.validate({
    mid: req.body.mid,
    createdby: req.body.createdby,
    comment: req.body.comment,
    nodeid: req.body.nodeid,
    lon: req.body.lon,
    lat: req.body.lat,
    version: req.body.version
  });

  if (isValidated.error != null) {
    logger.error(JSON.stringify(isValidated.error.details));
    return res.status(404).json(isValidated.error.details);
  }

  try {
    // Prepare Database Update when OSM Submission is Successfully Created.
    let filterVal = { mid: isValidated.value.mid };
    const payloadVal = {
      notes: "Quest Marker Submitted To OSM",
      changedby: isValidated.value.createdby,
      createdon: dayjs()
    };

    const token = Buffer.from(
      `${process.env.OSM_PROD_USER}:${process.env.OSM_PROD_PASS}`,
      "utf8"
    ).toString("base64");

    const config = {
      headers: {
        "Content-Type": "application/xml",
        Authorization: `Basic ${token}`
      }
    };

    // globals
    let xmlTags = parseTagsToXML(req.body.tags);

    // Changeset Values
    // Create Changeset ID
    let changesetid = "";
    let xmlRequestChangeset = `<?xml version="1.0" encoding="UTF-8"?><osm><changeset version="0.6" generator="AccessCompleteWeb"><tag k="created_by" v="AccessComplete_Web"/><tag k="comment" v="${isValidated.value.comment}"/></changeset></osm>`;

    // return res.send(xmlChangesetData);
    logger.info(`[createChangesetRequestDEV] Requesting OSM Changeset ID `);
    logger.info(
      `[createChangesetRequestDEV] ${JSON.stringify(xmlRequestChangeset)}`
    );
    await axios
      .put(
        `${process.env.OSM_PROD_API}/api/0.6/changeset/create`,
        xmlRequestChangeset,
        config
      )
      .then(response => {
        logger.info(
          `[createChangesetRequestDEV] Received Changeset ID : ${response.data}`
        );
        changesetid = response.data;
      });

    let xmlChangesetData = `<osmChange version="0.6" generator="AccessCompleteWeb"><create/><modify><node id="${isValidated.value.nodeid}" lon="${isValidated.value.lon}" lat="${isValidated.value.lat}" version="${isValidated.value.version}" changeset="${changesetid}">${xmlTags}</node></modify><delete if-unused="true"/></osmChange>`;
    logger.info(`[createChangesetRequest] Starting Changeset Data Upload`);
    logger.info(
      `[createChangesetRequest] Sending Payload ${JSON.stringify(
        xmlChangesetData
      )}`
    );
    await axios
      .post(
        `${process.env.OSM_PROD_API}/api/0.6/changeset/${changesetid}/upload`,
        xmlChangesetData,
        config
      )
      .then(function(response) {
        logger.info(
          `[createChangesetRequestDEV] Successfully Uploaded Changeset Data`
        );
      });
    logger.info(`[createChangesetRequest] Closing Changeset Data Request`);
    await axios
      .put(
        `${process.env.OSM_PROD_API}/api/0.6/changeset/${changesetid}/close`,
        {},
        config
      )
      .then(function(response) {
        logger.info(
          `[createChangesetRequestDEV] Successfully Closed Changeset Data ${changesetid}`
        );

        locationSchema.findOneAndUpdate(
          filterVal,
          {
            updatedon: dayjs(),
            $push: {
              history: payloadVal
            }
          },
          function(err, success) {
            if (err) {
              logger.error(`[createChangesetRequestDEV]`);
              logger.error(err.message);
            }
            if (!success) {
              logger.error(
                `[createChangesetRequestDEV] No Matching Map Marker with ${isValidated.value.mid} Found.`
              );
              return res.status(404).json({
                message: "No Record Found Matching Map Marker ID."
              });
            }
            logger.info(
              `[createChangesetRequestDEV] Successfully Updated ${isValidated.value.mid} Record`
            );
          }
        );

        return res
          .status(200)
          .json("Successfully Uploaded Changeset Details to OSM Server");
      });
  } catch (err) {
    logger.error(err.message);
    return res.status(404).json(err.message);
  }
};

module.exports.closeChangesetDEV = function(req, res) {
  // Validation
  const changesetValidation = Joi.object({
    changesetid: Joi.string().required()
  });

  const isValidated = changesetValidation.validate({
    changesetid: req.body.changesetid
  });

  if (isValidated.error != null) {
    logger.error(JSON.stringify(isValidated.error.details));
    return res.status(404).json(isValidated.error.details);
  }

  try {
    const token = Buffer.from(
      `${process.env.OSM_DEV_USER}:${process.env.OSM_DEV_PASS}`,
      "utf8"
    ).toString("base64");
    let config = {
      headers: {
        "Content-Type": "application/xml",
        Authorization: `Basic ${token}`
      }
    };

    axios
      .put(
        `${process.env.OSM_DEV_API}/api/0.6/changeset/${isValidated.value.changesetid}/close`,
        {},
        config
      )
      .then(function(response) {
        logger.info(`[closeChangesetDEV] ${JSON.stringify(response.status)}`);
        return res.status(200).json(response.status);
      });
  } catch (err) {
    logger.error(`[closeChangesetDEV]`);
    logger.error(err.message);
    return res.status(404).json(err.message);
  }
};

// Submitting Data To OSM PROD
module.exports.submitOsmProd = function(req, res) {};

// Check Possible Duplicated Markers
module.exports.getTentativeDuplicateMarkers = function(req, res) {
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
  // Range by default it 100m
  try {
    const aggMarker = [
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [isValidated.value.long, isValidated.value.lat]
          },
          distanceField: "dist.calculated",
          maxDistance: 100
        }
      },
      { $match: { isActive: true } }
    ];

    locationSchema.aggregate(aggMarker).exec((err, success) => {
      if (err) {
        logger.error(`[getTentativeDuplicateMarkers] Error`);
        logger.error(`[getTentativeDuplicateMarkers] ${err.message}`);
        return res.status(500).json(err.message);
      }
      logger.info(`[getTentativeDuplicateMarkers] ${success}`);
      return res.status(200).json(success);
    });
  } catch (err) {
    logger.error(err.message);
    return res.status(500).json(err.message);
  }
};

// Activate or Deactivate a Quest Marker
module.exports.updateQuestMarkerStatus = function(req, res) {
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

  try {
    const now = dayjs();
    let filterVal = { mid: isValidated.value.mid };
    let historyVal = {
      timestamp: now,
      changedby: req.body.aid,
      description: `Updated Marker Status to ${isValidated.value.isActive}`
    };
    let updateVal = {
      isActive: isValidated.value.isActive,
      updatedon: now,
      history: historyVal
    };
    locationSchema.updateOne(filterVal, updateVal, function(err, success) {
      if (err) {
        logger.error(`[updateQuestMarkerStatus] Error`);
        logger.error(`[updateQuestMarkerStatus] ${err.message}`);
        return res.status(500).json(err.message);
      }
      logger.info(`[updateQuestMarkerStatus] ${JSON.stringify(success)}`);
      return res.status(200).json(success);
    });
  } catch (err) {
    logger.error(err.message);
    return res.status(500).json(err.message);
  }
};

module.exports.getUserMarkerSubmissions = function(req, res) {
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
    locationSchema.find({ updatedby: isValidated.value.aid }, function(
      err,
      success
    ) {
      if (err) {
        logger.error(`[getUserMarkerSubmissions] Error`);
        logger.error(`[getUserMarkerSubmissions] ${err.message}`);
        return res.status(500).json(err.message);
      }
      logger.info(
        `[getUserMarkerSubmissions] Successfully Retrieved Quest Markers for user ${isValidated.value.aid}`
      );
      return res.status(200).json(success);
    });
  } catch (err) {
    logger.error(err.message);
    return res.status(500).json(err.message);
  }
};
