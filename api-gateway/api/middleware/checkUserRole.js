// This middleware checks the role of the user based on the verified token
module.exports.checkUserRole = function(req, res, next) {
  console.log("Check User Data Authenticity");
  // Check the current record of the user if they have the correct Role
  // console.log("Get User Roles");
  if (req.user.role === "basic") {
    console.log(`User Role Type : Basic`);
    req.usertype = "basic";
    next();
  } else if (req.user.role === "admin") {
    // console.log(`User Role Type : Admin`);
    req.usertype = "admin";
    next();
  } else if (req.user.role === "business") {
    // console.log(`User Role Type : Business`);
    req.usertype = "business";
    next();
  } else if (req.user.role === "support") {
    // console.log(`User Role Type : Support`);
    req.usertype = "support";
    next();
  }
};
