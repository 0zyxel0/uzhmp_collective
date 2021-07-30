const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MemberSchema = new Schema({
  memberid: { type: "String", required: true, ref: "users" },
  access_level: {
    type: "String",
    enum: ["basic", "admin", "support", "business"],
    default: "basic"
  }
});

const OrganizationSchema = new Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    orgname: { type: "String", required: true },
    members: [MemberSchema],
    population: { type: "Number", default: 0 },
    access_level: { type: "String", default: "basic" }
  },
  { collection: "organizations" }
);

module.exports = mongoose.model("organizations", OrganizationSchema);
