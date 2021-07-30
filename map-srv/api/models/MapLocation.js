const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// ResourceID will be the resource or object that will use this
// mapping poing configuration.

// Coodinates takes in Long and lat

/**
 * geoloc - Data for MongoDB GeoJson Query
 * marker_location - Data for Leaflet Frontend Location
 * location - Data for Mobile as preferred format by Mobile Developer.
 */

const verifierData = new Schema({
  aid: { type: String },
  updatedon: { type: Date }
});

const tagData = new Schema({
  k: { type: String },
  v: { type: String }
});

const verHistory = new Schema({
  verifierid: { type: String },
  image_url: [{ type: String }],
  description: { type: String },
  notes: { type: String },
  createdon: { type: Date },
  timestamp: { type: Date },
  changedby: { type: String }
});

const QuestSchema = new Schema(
  {
    mid: { type: String, required: true, unique: true },
    location: {
      geo_type: {
        type: String,
        enum: ["point", "polygon", "node", "way", "relation"]
      },
      coordinates: {
        lat: { type: Number },
        long: { type: Number }
      }
    },
    marker_location: [{ type: Number }],
    geoloc: {
      type: { type: String, enum: ["Point", "Polygon"], default: "Point" },
      coordinates: {
        type: [Number],
        required: true
      }
    },
    title: { type: String, required: true },
    subtitle: { type: String },
    description: { type: String },
    image_url: [{ type: String }],
    verifier_count: { type: Number, default: 0 },
    verifiers: [verifierData],
    tags: [tagData],
    history: [verHistory],
    nodeid: { type: String },
    version: { type: String },
    changesetid: { type: String },
    comments: { type: String },
    isActive: { type: Boolean, default: true },
    createdon: { type: Date, default: Date.now },
    osmDev:{type:Boolean, default:false},
    osmProd:{type:Boolean, default:false}, 
    updatedby: { type: String, required: true },
    updatedon: { type: Date }
  },
  { collection: "quests" }
);

module.exports = mongoose.model("quests", QuestSchema);
