const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserProfileSchema = new Schema(
  {
    profileid:{ type: "String", required: true, unique: true},
    firstname: { type: "String", lowercase: true },
    lastname: { type: "String", lowercase: true },
    mobileno: { typeL: "String" },
    p_img: { type: "String"},
    is_verified: { type: "Boolean", default: false },
    is_active: { type: "Boolean", default: true },
    is_dark: { type: "Boolean", default: false },
    language: { type: "String", default: "EN", enum: ["EN", "DE", "FR", "IT"] },
    score: { type: "Number", default: 0 },
    groups: [{ type: Schema.Types.ObjectId, ref: "groups" }],
    orgs: [{ type: Schema.Types.ObjectId, ref: "organizations" }],
    join_date: { type: "Date", default: Date.now() },
    updatedat: { type: "Date", default: Date.now()}
  },
  { collection: "user_profile" }
);

module.exports = mongoose.model("user_profile", UserProfileSchema);
