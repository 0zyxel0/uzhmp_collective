// Import libraries
const mongoose = require("mongoose");
const moment = require("moment");
const passport = require("passport");
const validator = require("express-validator");
const Joi = require("joi");
// Helper Files
const utils = require("../lib/utils");
// Import Schemas
const UserSchema = require("../models/User");
const UserScoreSchema = require("../models/UserScore");
const logger = require("../logger");

// Test Endpoint
module.exports.testEndpoint = function(req, res) {
  return res.status(200).json({ Status: "Active" });
};

// Registration Endpoint
module.exports.register = [
   // validations rules
   validator.body('fname', 'Please enter First Name').isLength({ min: 1 }),
   validator.body('lname', 'Please enter Last Name').isLength({ min: 1 }),
   validator.body('email', 'Please enter Email').isLength({ min: 1 }),
   validator.body('email').custom(value => {
     return UserSchema.findOne({email:value}).then(user => {
       if (user !== null) {
         return Promise.reject('Email address already in use');
       }
     })
   }),
   validator.body('password', 'Please enter Password').isLength({ min: 1 }),

   function(req, res) {
     // throw validation errors
     const errors = validator.validationResult(req);
     if (!errors.isEmpty()) {
       console.log(errors);
       return res.status(422).json({ success:false, message:"Request cannot be processed. Request may have been malformed or the semantics used are not correct" });
     }

    try {
      const saltHash = utils.genPassword(req.body.password);
      const salt = saltHash.salt;
      const hash = saltHash.hash;
      // Construct the request for based on UserSchema
      const newUser = new UserSchema({
        // username: req.body.uname,
        firstname: req.body.fname,
        lastname: req.body.lname,
        email: req.body.email,
        hash: hash,
        salt: salt
      });
  
      newUser.save().then(user => {
        return res.status(201).json({ success: true, user: user , message:"User Account Successfully Registered"});
      });
    } catch (err) {
      return res.status(409).json({ success: false, message: "Error Saving Record" });
    }
  }
];

// Login Endpoint
module.exports.login = function(req, res) {

  // Validation
  const MarkerValidation = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
  });

  const isValidated = MarkerValidation.validate({
    email: req.body.email,
    password: req.body.password,
  });

  if (isValidated.error != null) {
    logger.error(JSON.stringify(isValidated.error.details));
    return res.status(404).json(isValidated.error.details);
  }

    try {
      UserSchema.findOne({ email: isValidated.value.email })
        .then(user => {
          if (!user) {
            logger.error(`[login] User ${isValidated.value.email} Does Not Exist`);
            return res
              .status(401)
              .json({
                success: false,
                message: "Email Record Does Not Exist."
              });
          }

          const isValid = utils.validPassword(
            isValidated.value.password,
            user.hash,
            user.salt
          );

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
                logger.error(error);
              }
              logger.info(`[login] ${isValidated.value.email} Updating User Login Time Record`);              
            });
            logger.info(`[login] Sending JWT Token Response`);
            // Call Util function to issue JWT to user
            const tokenObject = utils.issueJWT(user);
            res.status(200).json({
              success: true,
              email: user.email,
              role: user.role,
              token: tokenObject.token,
              expiresIn: tokenObject.expires
            });
          } else {
            logger.info(`[login] Invalid Email or Password Provided`);
            return res
              .status(401)
              .json({ success: false, message: "Invalid Email or Password" });
          }
        })
        .catch(err => {
          logger.error(err);
          return res
            .status(500)
            .json({ error: err, message: "Error In Logging" });
        });
    } catch (err) {
      logger.error(err);
    }
  };

// Check if User is Authenticated for Protected Dashboard Route
module.exports.dashboard = function(req, res, next) {
  // Check data inside the token
  // This Route will recieve a variable from the middleware to check the usertype and route the user
  try {
    if (req.usertype === "basic") {
      res.status(200).json({
        success: true,
        path: "/user/dashboard",
        dtype: "brd", //Defines the Dashboard type to present to the user
        meta: req.user,
        message: "Successfully Authenticated!"
      });
    } else if (req.usertype === "admin") {
      res.status(200).json({
        success: true,
        path: "/user/a-dashboard",
        dtype: "abrd", //Defines the Dashboard type to present to the user
        meta: req.user,
        message: "Successfully Authenticated!"
      });
    } else if (req.usertype === "business") {
      res.status(200).json({
        success: true,
        path: "/user/b-dashboard",
        dtype: "bbrd", //Defines the Dashboard type to present to the user
        meta: req.user,
        message: "Successfully Authenticated!"
      });
    } else if (req.usertype === "support") {
      res.status(200).json({
        success: true,
        path: "/user/s-dashboard",
        dtype: "sbrd", //Defines the Dashboard type to present to the user
        meta: req.user,
        message: "Successfully Authenticated!"
      });
    } else {
      res.status(200).json({
        success: true,
        path: "/user/dashboard",
        dtype: "brd", //Defines the Dashboard type to present to the user
        meta: req.user,
        message: "Successfully Authenticated!"
      });
    }
  } catch (err) {
    res.status(500).json({ error: err, message: "Something Went Wrong." });
  }
};
