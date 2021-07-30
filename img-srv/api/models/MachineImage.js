const mongoose = require("mongoose");
const Schema = mongoose.Schema;
import { nanoid } from "nanoid";

//Generate a random unique ID
let ranid = nanoid(21);

// res_type defines what kind of resource has been uploaded and what it will be used  for

const MachineImageSchema = new Schema(
  {
    img_id: { type: String, default: ranid },
    img_name: { type: String, required: true },
    img_url: { type: String, required: true },
    size: { type: Number, required: true },
    mimetype: { type: String, required: true },
    uploadedby: { type: String, required: true },
    res_type: {
      type: String,
      default: "res"
    },
    isDeleted: { type: Boolean, default: false },
    updatedon: { type: Date },
    timestamp: { type: Date, default: Date.now() }
  },
  { collection: "rsimgs" }
);

module.exports = mongoose.model("rsimgs", MachineImageSchema);
