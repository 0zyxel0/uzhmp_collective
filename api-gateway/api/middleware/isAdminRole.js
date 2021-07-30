// This middleware checks the role of the user if they are of ADMIN user Type
module.exports.isAdminRole = function(req, res, next) {
  // Check the user role
  
  if (req.user.meta.role === "admin") {
    // Pass parameter for the Controller to Read if user is admin type
    req.is_admin = true;
    next();
  } else {
    return res.status(409).json("Unauthorized!");
  }
}