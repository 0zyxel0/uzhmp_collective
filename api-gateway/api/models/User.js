const mongoose = require("mongoose");
const Schema = mongoose.Schema;
/**
 * @param {String} p_img - Defines the Profile Image URL
 */

const UserSchema = new Schema(
  {
    aid: { type: "String", required: true, unique: true}, // Random Account ID
    email: { type: "String", required: true, lowercase: true, unique: true },
    hash: { type: "String", required: true },
    salt: { type: "String", required: true },
    profileid: { type: "String", required: true, unique: true},
    last_loggedin: { type: "Date", default: Date.now() },
    join_date: { type: "Date", default: Date.now() }
  },
  { collection: "users" }
);

module.exports = mongoose.model("users", UserSchema);
