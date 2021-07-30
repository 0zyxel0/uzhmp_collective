const logger = require("../logger");

// This middleware checks the role of the user if they are of ADMIN user Type
module.exports.checkRolePermission = function(req, res, next) {
  logger.info(
    `[Middleware] [checkRolePermission] Checking Role Permission for User ID ${req.user.aid} : Email ${req.user.email}.`
  );
  if (req.user.meta.role === "admin") {
    logger.info(
      `[Middleware] [checkRolePermission] User ${req.user.aid} is Admin`
    );
    next();
  } else {
    return res.status(409).json("Unauthorized!");
  }
};
