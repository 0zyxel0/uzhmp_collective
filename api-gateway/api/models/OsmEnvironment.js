const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OsmSchema = new Schema(
  {
    osm_id:{ type: "Number", default:1},
    osm_environment: { type: Boolean, default: false } // When False you will be using DEVELOPMENT else PRODUCTION
  },
  { collection: "osm_environment" }
);

module.exports = mongoose.model("osm_environment", OsmSchema);
