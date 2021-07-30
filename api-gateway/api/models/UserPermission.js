const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserPermissionSchema = new Schema(
  {
    aid: { type: "String", required: true, unique: true },
    role: {
      type: "String",
      default: "basic",
      enum: ["basic", "admin", "moderator", "business", "support"]
    },
    permissions: [],
    updatedat: { type: "Date", default: Date.now() }
  },
  { collection: "user_permission" }
);

module.exports = mongoose.model("user_permission", UserPermissionSchema);
