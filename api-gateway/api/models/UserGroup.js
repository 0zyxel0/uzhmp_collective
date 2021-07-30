const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GroupSchema = new Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    groupname: { type: "String", required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "users" }],
    access_level: { type: "String", default: "basic" }
  },
  { collection: "groups" }
);

module.exports = mongoose.model("groups", GroupSchema);
