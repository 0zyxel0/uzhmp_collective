const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserScoreSchema = new Schema(
  {
    userid: { type: "String", required: true }, // User Creation will bind this data
    score: { type: "Number", default: 0 },
    updatedAt: { type: "Date", default: Date.now() }
  },
  { collection: "user_score" }
);

module.exports = mongoose.model("user_score", UserScoreSchema);
