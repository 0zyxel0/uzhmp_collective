const UserSchema = require("../models/User");
const logger = require("../logger");
// This middleware checks the role of the user based on the verified token
module.exports.checkRecordExist = function(req, res, next) {
  logger.info(
    `[Middleware] [checkRecordExist] Checking Records for ${req.body.email} if Email Exists...`
  );
  UserSchema.findOne({ email: req.body.email })
    .then(email => {
      if (email !== null) {
        logger.info(
          `[Middleware] [checkRecordExist] Email : ${req.body.email} Already Exists...`
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
        `[Middleware] [checkRecordExist] ${JSON.stringify(err.message)}`
      );
      return res.status(500).json({ message: err.message });
    });
};
