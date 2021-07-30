// Import libraries
const mongoose = require("mongoose");
const moment = require("moment");
const passport = require("passport");
const validator = require("express-validator");
// Helper Files
const utils = require("../lib/utils");

// Models

const UserGroupSchema = require("../models/UserGroup");
const e = require("cors");

// Test Endpoint
module.exports.createGroups = [
  // validations rules
  validator.body("groupname", "Please enter Group Name").isLength({ min: 1 }),
  validator.body("groupname").custom(value => {
    return UserGroupSchema.findOne({ groupname: value }).then(group => {
      if (group !== null) {
        return Promise.reject("Group Name already in existing!");
      }
    });
  }),
  function(req, res, next) {
    if (req.is_admin) {
      // Construct the request for based on UserSchema
      let newGroups = new UserSchema({
        groupname: req.body.groupname,
        members: [{ type: Schema.Types.ObjectId }]
      });

      try {
        newGroups.save().then(groups => {
          res.json({ success: true, groups: groups });
        });
      } catch (err) {
        res.status(409).json({ success: false, msg: err });
      }
    } else {
      return res.status(401).json("Unauthorized");
    }
  }
];

module.exports.addGroupMembers = function(req, res) {
  if (req.is_admin) {
    UserGroupSchema.updateOne(
      { _id: req.body.groupid },
      {
        $push: { members: [req.body.userid] }
      },
      { upsert: true },
      function(error, success) {
        if (error) {
          console.log(error);
        } else {
          console.log(success);
        }
      }
    );
  } else {
    return res.status(401).json("Unauthorized");
  }
};
