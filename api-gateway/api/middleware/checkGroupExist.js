// This middleware checks if the Group Already Exists in the Database.

const UserGroupSchema = require("../models/UserGroup");
const logger = require("../logger");

module.exports.checkGroupNameExist = function(req, res, next) {
  logger.info(
    `[Middleware] [checkGroupNameExist] Checking Records for ${req.body.groupname} if Group Exists...`
  );
  UserGroupSchema.findOne({ groupname: req.body.groupname })
    .then(response => {
      if (response !== null) {
        logger.info(
          `[Middleware] [checkGroupNameExist] Email : ${req.body.email} Already Exists...`
        );
        return res.status(409).json("Group Name Already Exists.");
      } else {
        next();
      }
    })
    .catch(err => {
      logger.error(
        `[Middleware] [checkGroupNameExist] ${JSON.stringify(err.message)}`
      );
      return res.status(500).json(err.message);
    });
};
