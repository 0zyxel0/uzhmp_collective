const Joi = require("joi");
const moment = require("moment");
const UserSchema = require("../models/User");

// Test Endpoint
module.exports.testEndpoint = function(req, res) {
  return res.status(200).json({ Status: "Active" });
};

// Get All Users
module.exports.getUsers = function(req, res, next) {
  // Data is going to the if the middleware checks the verified token user is with Admin Role
  if (req.is_admin) {
    // Get Data from Middleware and Proceed in the function
    UserSchema.find({}, function(err, user) {
      if (err) {
        return res.status(500).json({
          message: "Error in Searching User Profile",
          error: err.message
        });
      }
      if (!user) {
        return res.status(404).json({
          message: "User Record Does Not Exist"
        });
      }
      return res.status(200).json(user);
    });
  } else {
    return res.status(401).json("Unauthorized");
  }
};

// Get Logged in User Details
module.exports.getUserProfileDetails = function(req, res) {
  return res.status(200).json({ user: req.user });
};

// Update User Profile Image
/**
 * 
 * @param {String} aid User AID from JWT Token
 * @param {String} profile_img User Profile Image Url that is returned from the Image Service 
 * @returns {String} clonedResult
 */
 module.exports.updateUserProfileImg = async function(req, res) {

  // Check if User is an admin
  if(req.usertype != "admin"){
    console.log(`[INFO] INSUFFICIENT USER RIGHTS`);
    return res.status(401).json("[ERROR] UNAUTHORIZED. Insufficient User Rights");
  }
  // Validation Rules
  const UserValidation = Joi.object({
    aid: Joi.string().required(),
    profile_img : Joi.string().required()
  });

  const isValidated = UserValidation.validate({
    aid: req.user.aid,
    profile_img : req.body.profile_img
  });

  if(isValidated.error != null){
    console.log(`[ERROR] ${JSON.stringify(isValidated.error.details)}`);
    return res.status(404).json(isValidated.error.details);
  }

    try{
      const filterData = { aid: req.user.aid };
      const recUpdate = { profile_img: isValidated.value.profile_img };
      const optionData = {returnOriginal: false, new:true};
      let docResult = await UserSchema.findOneAndUpdate(filterData, recUpdate, optionData, (err,success) => {
        if (err) {
          return res.status(500).json({
            message: "[ERROR] Error in Updating User Profile",
            error: err.message
          });
        }
        if (!success) {
          return res.status(404).json({
            message: "[ERROR] User Record Does Not Exist"
          });
        }
      });
          // Clone Mongo Response for cleaning
          let clonedResult = Object.assign({},docResult._doc);
          // Clean the Cloned Object
          delete clonedResult._id;
          delete clonedResult.__v;
          delete clonedResult.hash;
          delete clonedResult.salt;
          delete clonedResult.last_loggedin;
          return res.status(201).json(clonedResult);
    }
    catch(err){
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
  
  // Check if User is an admin
  if(req.usertype != "admin"){
    console.log(`[INFO] INSUFFICIENT USER RIGHTS`);
    return res.status(401).json("[ERROR] UNAUTHORIZED. Insufficient User Rights");
  }

  // Validation Rules
  const UserValidation = Joi.object({
    aid: Joi.string().required(),
    firstname: Joi.string().required(),
    lastname: Joi.string().required(),
    mobileno: Joi.string().required(),
    email: Joi.string().required(),
    role: Joi.string().required(),
    board: Joi.string().required(),
    language: Joi.string().required(),
    is_active: Joi.boolean().required(),
    is_dark: Joi.boolean().required(),
    is_verified: Joi.boolean().required()
  });

  const isValidated = UserValidation.validate({
    aid: req.user.aid,
    firstname: req.body.fname,
    lastname: req.body.lname,
    mobileno: req.body.mobileno,
    email: req.body.email,
    role: req.body.role,
    board: req.body.board,
    language: req.body.language,
    is_active: req.body.is_active,
    is_dark: req.body.is_dark,
    is_verified: req.body.is_verified
  });

  if(isValidated.error != null){
    console.log(`[ERROR] ${JSON.stringify(isValidated.error.details)}`);
    return res.status(404).json(isValidated.error.details);
  }
  try{
    
    const filterData = { aid:isValidated.value.aid, email:isValidated.value.email};
    const updateData = isValidated.value;
    const optionData = {returnOriginal: false, new:true};

    console.log(`[INFO] UPDATING INFO : ${JSON.stringify(filterData)}`);
    console.log(`[INFO] UPDATING DOCUMENT : ${JSON.stringify(updateData)}`);

    const docResult = await UserSchema.findOneAndUpdate(filterData, updateData,optionData, (err, doc) => {
      if (err) console.log(`[ERROR] ${JSON.stringify(err.message)}`);
      console.log(`[SUCCESS] UPDATED DOCUMENT : ${JSON.stringify(doc)}`);
    });
    // Clone Mongo Response for cleaning
    let clonedResult = Object.assign({},docResult._doc);
      // Clean the Cloned Object
      delete clonedResult._id;
      delete clonedResult.__v;
      delete clonedResult.hash;
      delete clonedResult.salt;
      delete clonedResult.last_loggedin;
    return res.status(201).json(clonedResult);
  }
  catch(err){
    console.log(err);
    return res.status(400).json(err.message);
  }
};

// Update User Groups
