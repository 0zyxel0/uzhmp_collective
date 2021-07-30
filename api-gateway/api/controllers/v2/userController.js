const Joi = require("joi");
const moment = require("moment");
const UserSchema = require("../../models/User");
const UserProfileSchema = require("../../models/UserProfile");
const UserPermissionSchema = require("../../models/UserPermission");
const OsmSchema = require("../../models/OsmEnvironment");
const logger = require("../../logger");
const _ = require("lodash");
// Test Endpoint
module.exports.testEndpoint = function(req, res) {
  return res.status(200).json({ Status: "Active" });
};

// Get All Users
module.exports.getUsersList = function(req, res, next) {
  logger.info(`[getUsersList] Requesting User List`);

  const aggVal = [
    {
      $lookup: {
        from: "user_profile",
        localField: "profileid",
        foreignField: "profileid",
        as: "profile"
      }
    },
    {
      $project: {
        _id: 1,
        last_loggedin: 1,
        join_date: 1,
        aid: 1,
        profileid: 1,
        email: 1,
        profile: 1
      }
    },
    {
      $unwind: {
        path: "$profile"
      }
    }
  ];

  try {
    UserSchema.aggregate(aggVal).exec((err, success) => {
      if (err) {
        logger.error(`[getUsersList] Error in Requesting User List`);
        logger.error(err.message);
        return res.status(500).json(err.message);
      }
      logger.info(`[getUsersList] Successfully Retrieved User List`);

      return res.status(200).json(success);
    });
  } catch (err) {
    logger.error(`[getUsersList] Error In Retrieving User Profile`);
    logger.error(err.message);
    return res.status(500).json(err.message);
  }
};

// Get Logged in User Details
module.exports.getCurrentUserProfileDetails = function(req, res) {
  logger.info(`[getUserProfileDetails] Parsing JWT Data`);

  const aggVal = [
    {
      $match: {
        profileid: req.user.profileid
      }
    },
    {
      $lookup: {
        from: "user_profile",
        localField: "profileid",
        foreignField: "profileid",
        as: "profile"
      }
    },
    {
      $lookup: {
        from: "user_permission",
        localField: "aid",
        foreignField: "aid",
        as: "meta"
      }
    },
    {
      $project: {
        _id: 1,
        last_loggedin: 1,
        join_date: 1,
        aid: 1,
        profileid: 1,
        email: 1,
        profile: 1,
        meta: 1
      }
    },
    {
      $unwind: {
        path: "$profile"
      }
    },
    {
      $unwind: {
        path: "$meta"
      }
    }
  ];
  try {
    function cleanProfileData(payload) {
      // This Function Cleans the aggregated profile data from the Database.
      // The Process Unsets the data from the array and returns an object.
      delete payload[0].last_loggedin;
      delete payload[0].join_date;
      delete payload[0].profile.updatedat;
      delete payload[0].profile._id;
      delete payload[0].profile.__v;
      delete payload[0].profile.profileid;
      delete payload[0].meta._id;
      delete payload[0].meta.__v;
      delete payload[0].meta.aid;
      delete payload[0].meta.updatedat;
      return payload[0];
    }

    logger.info(
      `[getUserProfileDetails] Retrieving User Profile Data Based on Token`
    );
    UserSchema.aggregate(aggVal).exec((err, success) => {
      if (err) throw err;
      logger.info(
        `[getUserProfileDetails] Successfully Retrieved User Profile`
      );
      let cleanedProfile = cleanProfileData(success);
      return res.status(200).json({ user: cleanedProfile });
    });
  } catch (err) {
    logger.error(`[getUserProfileDetails] Error In Retrieving User Profile`);
    logger.error(err.message);
    return res.status(500).json(err.message);
  }
};

// Update User Profile Image
/**
 *
 * @param {String} aid User AID from JWT Token
 * @param {String} profile_img User Profile Image Url that is returned from the Image Service
 * @returns {String} clonedResult
 */
module.exports.updateUserProfileImg = async function(req, res) {
  // Validation Rules
  const UserValidation = Joi.object({
    aid: Joi.string().required(),
    p_img: Joi.string().required()
  });

  const isValidated = UserValidation.validate({
    aid: req.body.aid,
    p_img: req.body.p_img
  });

  if (isValidated.error != null) {
    console.log(`[ERROR] ${JSON.stringify(isValidated.error.details)}`);
    return res.status(404).json(isValidated.error.details);
  }

  try {
    logger.info(`[updateUserProfileImg] Checking User Profile ID`);
    let userDetails = await UserSchema.findOne({ aid: isValidated.value.aid });
    logger.info(
      `[updateUserProfileImg] Updating User ${userDetails.profileid} Profile Image`
    );
    const filterData = { profileid: userDetails.profileid };
    const recUpdate = { p_img: isValidated.value.p_img };
    const optionData = { returnOriginal: false, new: true };
    let docResult = await UserProfileSchema.findOneAndUpdate(
      filterData,
      recUpdate,
      optionData,
      function(err, success) {
        if (err) {
          logger.error(
            `[updateUserProfileImg] Error in Updating Profile Image`
          );
          logger.error(err.message);
          return res.status(500).json(err.message);
        }
        if (!success) {
          return res
            .status(404)
            .json(`User Record ${userDetails.profileid} Does Not Exist`);
        }
        logger.info(
          `[updateUserProfileImg] Successfully Updated Profile Image.`
        );
      }
    );
    // Clone Mongo Response for cleaning
    let clonedResult = Object.assign({}, docResult._doc);
    // Clean the Cloned Object
    delete clonedResult._id;
    delete clonedResult.__v;
    delete clonedResult.hash;
    delete clonedResult.salt;
    delete clonedResult.last_loggedin;
    return res.status(201).json(clonedResult);
  } catch (err) {
    console.log(err);
    return res.status(400).json(err.message);
  }
};

// Update User Profile
/**
 *
 * @param {String} aid User ID from JWT
 * @param {String} fname Define the First name Value
 * @param {String} lname Define the Last name Value
 * @param {String} mobileno Define the Mobile name value
 * @param {String} email Define the email value
 * @param {String} role Define user roles
 * @param {String} board Define user board settings
 * @param {String} language Define User Language Setting
 * @param {String} is_active Define if User Profile is Active
 * @param {String} is_dark Define User Theme
 * @param {String} is_verified Define if User email verified
 * @returns {String} clonedResult
 */

module.exports.updateUserProfile = async function(req, res) {
  // Validation Rules
  const UserValidation = Joi.object({
    profileid: Joi.string().required()
  });

  const isValidated = UserValidation.validate({
    profileid: req.body.profileid
  });

  if (isValidated.error != null) {
    logger.error(JSON.stringify(isValidated.error.details));
    return res.status(404).json(isValidated.error.details);
  }
  try {
    const filterData = {
      profileid: isValidated.value.profileid
    };

    const updateData = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      updatedat: new moment()
    };
    const optionData = { returnOriginal: false, new: true };

    logger.info(`Updating User Profile : ${JSON.stringify(filterData)}`);
    logger.info(
      `Updating User Profile Records : ${JSON.stringify(updateData)}`
    );

    const docResult = await UserProfileSchema.findOneAndUpdate(
      filterData,
      updateData,
      optionData
    );
    // Clone Mongo Response for cleaning
    let clonedResult = Object.assign({}, docResult._doc);
    // Clean the Cloned Object
    delete clonedResult._id;
    delete clonedResult.__v;
    return res.status(201).json(clonedResult);
  } catch (err) {
    logger.error(err.message);
    return res.status(400).json(err.message);
  }
};

// Incrementing The User Score by 1
module.exports.incrementingUserScore = async function(req, res) {
  // Validation Rules
  const UserValidation = Joi.object({
    aid: Joi.string().required()
  });

  const isValidated = UserValidation.validate({
    aid: req.body.aid
  });

  if (isValidated.error != null) {
    console.log(`[ERROR] ${JSON.stringify(isValidated.error.details)}`);
    return res.status(404).json(isValidated.error.details);
  }

  try {
    logger.info(
      `[incrementUserScore] Updating User ${isValidated.value.aid} Score`
    );

    logger.info(
      `[incrementUserScore] Retreiving User Profile ${isValidated.value.aid}`
    );
    let userProfile = await UserSchema.findOne({ aid: isValidated.value.aid });
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
    return res.status(200).json(userScore.ok);
  } catch (err) {
    logger.error(`[incrementUserScore] Error Updating User Score`);
    logger.error(err.message);
    return res.status(500).json(err.message);
  }
  return res.send("done");
};

// View User Profile Details
module.exports.viewUserProfileDetails = function(req, res) {
  // Validation Rules
  const UserValidation = Joi.object({
    aid: Joi.string().required()
  });

  const isValidated = UserValidation.validate({
    aid: req.params.id
  });

  if (isValidated.error != null) {
    console.log(`[ERROR] ${JSON.stringify(isValidated.error.details)}`);
    return res.status(404).json(isValidated.error.details);
  }

  logger.info(`[viewUserProfileDetails] Requesting User Profile Details`);

  const aggVal = [
    {
      $match: {
        aid: isValidated.value.aid
      }
    },
    {
      $lookup: {
        from: "user_profile",
        localField: "profileid",
        foreignField: "profileid",
        as: "profile"
      }
    },
    {
      $lookup: {
        from: "user_permission",
        localField: "aid",
        foreignField: "aid",
        as: "meta"
      }
    },
    {
      $project: {
        _id: 1,
        last_loggedin: 1,
        join_date: 1,
        aid: 1,
        profileid: 1,
        email: 1,
        profile: 1,
        meta: 1
      }
    },
    {
      $unwind: {
        path: "$profile"
      }
    },
    {
      $unwind: {
        path: "$meta"
      }
    }
  ];

  try {
    logger.info(
      `[viewUserProfileDetails] Retrieving User Profile Data Based on Token`
    );
    UserSchema.aggregate(aggVal).exec((err, success) => {
      if (err) throw err;
      logger.info(
        `[viewUserProfileDetails] Successfully Retrieved User Profile`
      );
      return res.status(200).json(success[0]);
    });
  } catch (err) {
    logger.error(`[viewUserProfileDetails] Error In Retrieving User Profile`);
    logger.error(err.message);
    return res.status(500).json(err.message);
  }
};

module.exports.activateUserProfile = async function(req, res) {
  // Validation Rules
  const UserValidation = Joi.object({
    profileid: Joi.string().required()
  });

  const isValidated = UserValidation.validate({
    profileid: req.body.profileid
  });

  if (isValidated.error != null) {
    console.log(`[ERROR] ${JSON.stringify(isValidated.error.details)}`);
    return res.status(404).json(isValidated.error.details);
  }
  logger.info(
    `[activateUserProfile] Activate User Profile ${isValidated.value.aid}`
  );
  try {
    let curProfile = await UserProfileSchema.findOne({
      profileid: isValidated.value.profileid
    });
    curProfile.is_active = true;
    await curProfile.save();
    logger.info(`[activateUserProfile] Successfully Activated User Profile`);
    return res.status(201).json("Successfully Activated User");
  } catch (err) {
    logger.error(`[activateUserProfile] Error In Retrieving User Profile`);
    logger.error(err.message);
    return res.status(500).json(err.message);
  }
};

module.exports.deactivateUserProfile = async function(req, res) {
  // Validation Rules
  const UserValidation = Joi.object({
    profileid: Joi.string().required()
  });

  const isValidated = UserValidation.validate({
    profileid: req.body.profileid
  });

  if (isValidated.error != null) {
    console.log(`[ERROR] ${JSON.stringify(isValidated.error.details)}`);
    return res.status(404).json(isValidated.error.details);
  }
  logger.info(
    `[deactivateUserProfile] Activate User Profile ${isValidated.value.aid}`
  );
  try {
    let curProfile = await UserProfileSchema.findOne({
      profileid: isValidated.value.profileid
    });
    curProfile.is_active = false;
    await curProfile.save();
    logger.info(
      `[deactivateUserProfile] Successfully Deactivated User Profile`
    );
    return res.status(201).json("Successfully Deactivated User");
  } catch (err) {
    logger.error(`[deactivateUserProfile] Error In Retrieving User Profile`);
    logger.error(err.message);
    return res.status(500).json(err.message);
  }
};

// This function will be updaitng the User Role to a Moderator/Admin Role
module.exports.updateUserRoleAdmin = async function(req, res) {
  // Validation Rules
  const UserValidation = Joi.object({
    aid: Joi.string().required()
  });

  const isValidated = UserValidation.validate({
    aid: req.body.aid
  });

  if (isValidated.error != null) {
    logger.error(
      `[updateUserRoleAdmin] ${JSON.stringify(isValidated.error.details)}`
    );
    return res.status(404).json(isValidated.error.details);
  }

  logger.info(
    `[updateUserRoleAdmin] Updating User Role of Profile ${isValidated.value.aid}`
  );

  try {
    let curProfile = await UserPermissionSchema.findOne({
      aid: isValidated.value.aid
    });
    curProfile.role = "admin";
    await curProfile.save();
    logger.info(
      `[updateUserRoleAdmin] Successfully Updated User  Role Profile`
    );
    return res.status(201).json("Successfully Updated User Role");
  } catch (err) {
    logger.error(`[updateUserRoleAdmin] Error In Retrieving User Profile`);
    logger.error(err.message);
    return res.status(500).json(err.message);
  }
};

// This function will be updaitng the User Role to a Moderator/Admin Role
module.exports.updateUserRoleBasic = async function(req, res) {
  // Validation Rules
  const UserValidation = Joi.object({
    aid: Joi.string().required()
  });

  const isValidated = UserValidation.validate({
    aid: req.body.aid
  });

  if (isValidated.error != null) {
    logger.error(
      `[updateUserRoleBasic] ${JSON.stringify(isValidated.error.details)}`
    );
    return res.status(404).json(isValidated.error.details);
  }

  logger.info(
    `[updateUserRoleBasic] Updating User Role of Profile ${isValidated.value.aid}`
  );

  try {
    let curProfile = await UserPermissionSchema.findOne({
      aid: isValidated.value.aid
    });
    curProfile.role = "basic";
    await curProfile.save();
    logger.info(
      `[updateUserRoleBasic] Successfully Updated User  Role Profile`
    );
    return res.status(201).json("Successfully Updated User Role");
  } catch (err) {
    logger.error(`[updateUserRoleBasic] Error In Retrieving User Profile`);
    logger.error(err.message);
    return res.status(500).json(err.message);
  }
};

// This function triggers when the user Changes the OSM Environment To Be Used
module.exports.changeOsmEnvironment = async function(req, res) {
  // Validation Rules
  const UserValidation = Joi.object({
    osm_environment: Joi.boolean().required()
  });

  const isValidated = UserValidation.validate({
    osm_environment: req.body.osm_environment
  });

  if (isValidated.error != null) {
    logger.error(
      `[changeOsmEnvironment] ${JSON.stringify(isValidated.error.details)}`
    );
    return res.status(404).json(isValidated.error.details);
  }

  logger.info(`[changeOsmEnvironment] Updating OSM Environment`);
  try {
    let osmenv = await OsmSchema.findOneAndUpdate(
      { osm_id: 1 },
      { osm_environment: isValidated.value.osm_environment },
      { new: true }
    );
    logger.info(`[changeOsmEnvironment] Successfully Updated OSM Environment`);
    return res.status(201).json(osmenv);
  } catch (err) {
    logger.error(`[changeOsmEnvironment] Error In Updating OSM Environment`);
    logger.error(err.message);
    return res.status(500).json(err.message);
  }
};

// This function Checks what is the OSM environment that is being used by the Web App.
module.exports.checkOsmEnvironment = async function(req, res) {
  logger.info(`[checkOsmEnvironment] Checking OSM Environment Value`);
  try {
    let osmenv = await OsmSchema.findOne({ osm_id: 1 });
    if (osmenv) {
      logger.info(
        `[checkOsmEnvironment] OSM Environment Status ${osmenv.osm_environment}`
      );
      return res.status(200).json(osmenv);
    }
  } catch (err) {
    logger.error(
      `[checkOsmEnvironment] Error In Checking OSM Environment Value`
    );
    logger.error(err.message);
    return res.status(500).json(err.message);
  }
};
