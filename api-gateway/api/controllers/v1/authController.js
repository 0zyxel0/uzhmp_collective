// Import libraries
const moment = require("moment");
const Joi = require("joi");
// Helper Files
const utils = require("../../lib/v1/utils");
// Import Schemas
const UserSchema = require("../../models/User");
const UserProfileSchema = require("../../models/UserProfile");
const UserPermissionSchema = require("../../models/UserPermission");
const logger = require("../../logger");
const _ = require("lodash");
import { nanoid } from "nanoid";

// Test Endpoint
module.exports.testEndpoint = function(req, res) {
  return res.status(200).json({ Status: "Active" });
};

// Register
module.exports.register = function(req, res) {
  // Validation
  const userValidation = Joi.object({
    fname: Joi.string().required(),
    lname: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.string().required()
  });

  const isValidated = userValidation.validate({
    fname: req.body.fname,
    lname: req.body.lname,
    email: req.body.email,
    password: req.body.password
  });

  if (isValidated.error != null) {
    logger.error(JSON.stringify(isValidated.error.details));
    return res.status(404).json(isValidated.error.details);
  }

  try {
    let ranProfileid = nanoid(18);
    let ranaid = nanoid(15);
    const saltHash = utils.genPassword(isValidated.value.password);
    const salt = saltHash.salt;
    const hash = saltHash.hash;
    // Construct the request for based on UserSchema
    const newUser = new UserSchema({
      aid: ranaid,
      email: isValidated.value.email,
      hash: hash,
      salt: salt,
      profileid: ranProfileid
    });

    // Construct the User Profile Request
    const newUserProfile = new UserProfileSchema({
      profileid: ranProfileid,
      firstname: isValidated.value.fname,
      lastname: isValidated.value.lname
    });

    // Construct the User Permission Request
    const newUserPermission = new UserPermissionSchema({
      aid: ranaid
    });

    newUser.save().then(user => {
      logger.info(
        `[register] User ${user.aid} Successfully Registered with Profile Id ${user.profileid}`
      );

      newUserPermission.save().then(permission => {
        logger.info(
          `[register] User Permission ${permission.aid} Successfully Created`
        );
      });
    });

    newUserProfile.save().then(profile => {
      logger.info(`[register] User Profile Created for ${profile.profileid}`);
    });

    return res.status(201).json("Successfully Registered User");
  } catch (err) {
    logger.error(`[register] Error in Saving Record.`);
    logger.error(err.message);
    return res.status(409).json(err.message);
  }
};

// Login Endpoint
module.exports.login = function(req, res) {
  // Validation
  const MarkerValidation = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required()
  });

  const isValidated = MarkerValidation.validate({
    email: req.body.email,
    password: req.body.password
  });

  if (isValidated.error != null) {
    logger.error(JSON.stringify(isValidated.error.details));
    return res.status(404).json(isValidated.error.details);
  }

  try {
    UserSchema.findOne({ email: isValidated.value.email }).then(user => {
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Email Record Does Not Exist."
        });
      }

      const isValid = utils.validPassword(isValidated.value.password, user.hash, user.salt);

      if (isValid) {
        // Query Construct to update Users Last Login
        let now = moment();
        const query = {
          email: user.email
        };
        const updateQuery = {
          $currentDate: {
            lastModified: true,
            last_loggedin: now
          }
        };
        UserSchema.updateOne(query, updateQuery, function(error, success) {
          if (error) {
            console.log(error);
          }
          console.log("Updated User Last Login");
        });

        // Call Util function to issue JWT to user
        const tokenObject = utils.issueJWT(user);
        res.status(200).json({
          success: true,
          email: user.email,
          token: tokenObject.token,
          expiresIn: tokenObject.expires
        });
      } else {
        return res
          .status(401)
          .json({ success: false, message: "Invalid Email or Password" });
      }
    });
  } catch (err) {
    logger.error(`[login] Error in Logging in User`);
    logger.error(`[login] ${err.message}`);
    return res.status(500).json(err.message);
  }
};
