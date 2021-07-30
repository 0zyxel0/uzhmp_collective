// Import libraries
require("dotenv").config();
const path = require("path");
import { nanoid } from "nanoid";
const mongoose = require("mongoose");
const Multer = require("multer");
const { Storage } = require("@google-cloud/storage");
const dayjs = require("dayjs");

// Import Schemas
const MachineImageSchema = require("../models/MachineImage");
const G_PRIVATE_KEY = process.env.GCLOUD_PRIVATE_KEY.replace(/\\n/g, "\n");

const gcs_storage = new Storage({
  projectId: process.env.GCS_PROJECT,
  credentials: {
    client_email: process.env.GCLOUD_CLIENT_EMAIL,
    private_key: G_PRIVATE_KEY
  }
});

// Limit Files to be maximum of 5MB
const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

// Declare bucket lockation
const bucket = gcs_storage.bucket(process.env.GCS_BUCKET);

module.exports.testEndpoint = function(req, res) {
  return res.status(200).json({ status: "Active" });
};

module.exports.singleFileUploader = function (req, res) {
  //Return if Files is empty
  if (!req.file) {
    return res.status(400).send("No File Uploaded.");
  }

  // Get Original File
  let nwFileName = nanoid(19);
  let extFileName = req.file.originalname.split(".").pop();
  let conName = nwFileName + "." + extFileName;
  let mmFileType = req.file.mimetype;
  let fsize = req.file.size;
  // Initialize GCP Connection
  const blob = bucket.file(conName);
  const publicUrl = `https://storage.googleapis.com/${process.env.GCS_BUCKET}/${blob.name}`;

  console.log(`[INFO] Request to Save Image ${req.file.originalname}`);
  console.log(`[INFO] Generating File Name ${conName}`);
  console.log(`[INFO] Generating File Type ${mmFileType}`);
  console.log(`[INFO] Generating File Size ${fsize}`);

  let upImage = new MachineImageSchema({
    img_id: nwFileName,
    img_name: conName,
    img_url: publicUrl,
    mimetype: mmFileType,
    size: fsize,
    uploadedby: req.body.updatedby,
  });
  let resultMessage = {};
  const blobStream = blob.createWriteStream();
  blobStream.on("error", (err) => console.log(err));
  blobStream.on("finish", () => {
    upImage.save(function (err, success) {
      if (err) {
        console.log(
          `[ERROR] Error in Inserting Image Details to MongoDB. error : ${err}`
        );
      }
      if (!success) {
        console.log(`[WARN] Could not Contact MongoDB`);
      }
      let clonedSuccess = Object.assign({}, success._doc);
      // Clean the Cloned Object
      delete clonedSuccess._id;
      delete clonedSuccess.__v;
      delete clonedSuccess.isDeleted;
      delete clonedSuccess.res_type;
      resultMessage = clonedSuccess;
      console.log(
        `[INFO] Successfully Uploaded Image Data of ${nwFileName} as ${conName}`
      );
      console.log(`[INFO] ${JSON.stringify(resultMessage)}`);

      return res.status(200).json(resultMessage);
    });
  });
  blobStream.end(req.file.buffer);
};

module.exports.multiFileUploader = function(req, res) {
  // Initialize Variables
  let counter = 0;
  let up_errors = [];

  // Check how many objects inside the files array
  for (const obj of req.files) {
    counter++;
  }
  console.log(`[INFO] Processing ${counter} Files For Upload`);

  // Check if there are files passed
  if (counter == 0) {
    return res.status(400).send("No File Uploaded.");
  } else {
    const multiple_imgs = req.files;
    for (let values in multiple_imgs) {
      // Get Details of each Image Values
      let extFileName = multiple_imgs[values].originalname.split(".").pop();
      let newFileNanoId = nanoid(21);
      let newFileName = newFileNanoId + "." + extFileName;
      let mimeFileType = multiple_imgs[values].mimetype;
      let fsize = multiple_imgs[values].size;

      console.log(`[INFO] Request to Save Image ${multiple_imgs[values].originalname}`);
      console.log(`[INFO] Generating File Name ${newFileName}`);
      console.log(`[INFO] Generating File Type ${mimeFileType}`);
      console.log(`[INFO] Generating File Size ${fsize}`);

      // Open the Connection to the Memory Stream and Upload Data
      let blob = bucket.file(newFileName);
      const blobStream = blob.createWriteStream();
      const publicUrl = `https://storage.googleapis.com/${process.env.GCS_BUCKET}/${blob.name}`;

      // Form the Mongoose Request from the Model

      let upImage = new MachineImageSchema({
        img_id: newFileNanoId,
        img_name: newFileName,
        img_url: publicUrl,
        mimetype: mimeFileType,
        size: fsize,
        uploadedby: req.body.aid
      });

      // Log Transmitted Values
      blobStream.on("error", err => {
        up_errors.push({ multer: err.message });
      });

      blobStream.on("finish", () => {
        upImage.save(function(err, success) {
          if (err) {
            console.log(
              `[ERROR] Error in Inserting Image Details to MongoDB. error : ${err}`
            );
            up_errors.push({ mongodb: err.message });
          }
          if (!success) {
            console.log(`[WARN] Could not Contact MongoDB`);
          }
          console.log(
            `[INFO] Successfully Uploaded Image Data of ${newFileName}`
          );
        });
      });
      blobStream.end(multiple_imgs[values].buffer);
    }
  }
  if (up_errors.length == 0) {
    return res
      .status(200)
      .json({ success: true, message: "Successfully Uploaded Images" });
  } else {
    return res.status(500).json({ success: false, message: up_errors });
  }
};


// Get All Images Available
// Admins only
module.exports.getImageList = function(req, res) {
    const listFiltering = {
      _id: false,
      mimetype: false,
      size: false,
      isDeleted:false,
      uploadedby: false,
      __v: false
    };

    MachineImageSchema.find({ isDeleted: false }, listFiltering, function(
      err,
      list
    ) {
      if (err) {
        return res.status(500).json({
          message: "Error in Searching Image Lists",
          error: err.message
        });
      }
      return res.status(200).json(list);
    });
};

// Function that Gets Images details of given ID
// Requires Image ID
module.exports.getImageDetails = function(req, res) {
  const imgId = req.params.id;

  const listFiltering = {
    _id: false,
    __v: false,
    isDeleted: false
  };

  if (!imgId) {
    return res.status(404).json({
      message: "No Resource ID provided."
    });
  }

  MachineImageSchema.findOne(
    { img_id: imgId, isDeleted: false },
    listFiltering,
    function(err, details) {
      if (err) {
        return res.status(500).json({
          message: "Image Resource Not Found.",
          error: err.message
        });
      }
      return res.status(200).json(details);
    }
  );
};

// Function that Only Provides the user the Images they have uploaded.
module.exports.getMyImageList = function(req, res) {
  const userId = req.params.id;

  const listFiltering = {
    _id: false,
    __v: false,
    isDeleted: false,
    updatedon: false,
    uploadedby: false
  };

  const imageQuery = { uploadedby: userId, isDeleted: false };

  if (!userId) {
    return res.status(404).json({
      message:
        "User ID provided does not match any records, Please Enter Correct Credentials or Login Again.."
    });
  }

  MachineImageSchema.find(imageQuery, listFiltering, function(err, list) {
    if (err) {
      console.log(err.message);
      return res.status(500).json({
        message: "Error in Searching Image Lists",
        error: err.message
      });
    }
    return res.status(200).json(list);
  });
};

// This Functions updates the Image Record as a Deleted Record
module.exports.deleteImageRecord = function(req, res) {
  let userId = req.body.aid;
  let imageId = req.body.imageid;
  console.log(`User ${userId} Deleting Image ${imageId}`);

  MachineImageSchema.findOneAndUpdate(
    {
      img_id: imageId,
      uploadedby: userId
    },
    { isDeleted: true, updatedon: dayjs() },
    function(err, success) {
      if (err) {
        console.log(err.message);
        return res.status(500).json({
          message: "Error In Deleting Image."
        });
      } else {
        console.log(`Successfully Deleted Image Record ${imageId}`);
        return res.status(202).json({
          message: "Successfully Deleted Image"
        });
      }
    }
  );
};
