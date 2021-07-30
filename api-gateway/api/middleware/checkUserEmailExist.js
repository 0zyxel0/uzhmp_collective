// This middleware Checks if the Email Being Registered already Exists in the database.

const UserSchema = require("../models/User");
const logger = require("../logger");

module.exports.checkUserEmailExist = function(req, res, next) {
  logger.info(
    `[Middleware] [checkUserEmailExist] Checking Records for ${req.body.email} if Email Exists...`
  );
  UserSchema.findOne({ email: req.body.email })
    .then(email => {
      if (email !== null) {
        logger.info(
          `[Middleware] [checkUserEmailExist] Email : ${req.body.email} Already Exists...`
        );
        return res
          .status(409)
          .json({ message: `${req.body.email} Account Already Exists!` });
      } else {
        next();
      }
    })
    .catch(err => {
      logger.error(
        `[Middleware] [checkUserEmailExist] ${JSON.stringify(err.message)}`
      );
      return res.status(500).json({ message: err.message });
    });
};
