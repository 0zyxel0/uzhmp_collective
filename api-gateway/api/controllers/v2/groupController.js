// Import libraries
const moment = require("moment");
// Logging
const logger = require("../../logger");

// Validation Libraries
const Joi = require("joi");

// Models
const UserGroupSchema = require("../../models/UserGroup");

//Creating User Groups
module.exports.createUserGroups = function(req, res) {
  // Validation
  const MarkerValidation = Joi.object({
    groupname: Joi.string().required()
  });

  const isValidated = MarkerValidation.validate({
    groupname: req.body.groupname
  });

  if (isValidated.error != null) {
    logger.error(JSON.stringify(isValidated.error.details));
    return res.status(404).json(isValidated.error.details);
  }
  try {
    // Construct the request for based on UserSchema
    let newGroups = new UserGroupSchema({
      groupname: isValidated.value.groupname
    });

    logger.info(
      `[createUserGroups] Creating New User Group ${isValidated.value.groupname}`
    );
    newGroups.save().then(response => {
      logger.info(
        `[createUserGroups] Successfully Created Group ${isValidated.value.groupname}`
      );
      return res.status(200).json(response.data);
    });
  } catch (err) {
    logger.error(`[createUserGroups] Error in Saving Group Record.`);
    logger.error(err.message);
    return res.status(500).json(err.message);
  }
};

module.exports.addGroupMembers = function(req, res) {
    // UserGroupSchema.updateOne(
    //   { _id: req.body.groupid },
    //   {
    //     $push: { members: [req.body.userid] }
    //   },
    //   { upsert: true },
    //   function(error, success) {
    //     if (error) {
    //       console.log(error);
    //     } else {
    //       console.log(success);
    //     }
    //   }
    // );

    return res.end();
};
