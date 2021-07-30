// Proxy Requests to different service endpoints
const axios = require("axios");
require("dotenv").config();
import { nanoid } from "nanoid";
// Endpoints Controller for the Image Service
const Multer = require("multer");
const FormData = require("form-data");

module.exports.uploadSingleImage = async function(req, res) {
  //Return if Files is empty
  if (!req.file) {
    return res.status(400).send("No File Uploaded.");
  }

  // Get from middleware
  let extFileName = req.file.originalname.split(".").pop();
  let newFileNanoId = nanoid(18);
  let newFileName = newFileNanoId + "." + extFileName;
  let mimeFileType = req.file.mimetype;
  let fileSize = req.file.size;
  //   let updatedby = req.user.aid;

  const fileRecievedFromClient = req.file;
  // Create new Form Request to Pass
  const nwForm = new FormData();

  // We Pass the buffer data as a JSON Object
  nwForm.append(
    "file",
    fileRecievedFromClient.buffer,
    fileRecievedFromClient.originalname
  );
  nwForm.append("updatedby", req.user.aid);
  const config = {
    headers: {
      "Content-Type": `multipart/form-data; boundary=${nwForm._boundary}`
    }
  };
  await axios
    .post(`${process.env.IMG_SRV_API}/api/v1/upsrv/s`, nwForm, config)
    .then(function(response) {
      return res.status(200).json(response.data);
    })
    .catch(function(err) {
      return res.end(err);
    });
};

module.exports.uploadMultiImage = function(req, res) {
  // Initialize Variables
  let counter = 0;
  let up_errors = [];

  // Check how many objects inside the files array
  for (let obj of req.files) {
    counter++;
  }
  console.log(`[INFO] Processing ${counter} Files For Upload`);

  // Check if there are files passed
  if (counter == 0) {
    return res.status(404).send("No File Uploaded.");
  } else {
    let multiple_imgs = req.files;

    for (let imgs in multiple_imgs) {
      let nwForm = new FormData();
      // We Pass the buffer data as a JSON Object
      nwForm.append(
        `file`,
        multiple_imgs[imgs].buffer,
        multiple_imgs[imgs].originalname
      );
      nwForm.append(`updatedby`, req.user.aid);
      const config = {
        headers: {
          "Content-Type": `multipart/form-data; boundary=${nwForm._boundary}`
        }
      };
      axios
        .post(`${process.env.IMG_SRV_API}/api/v1/upsrv/s`, nwForm, config)
        .then(function(response) {
          console.log(response);
        })
        .catch(function(err) {
          console.log(`[ERROR] ${err.message}`);
        });
    }
    return res.status(200).json(response.data);
  }
};

module.exports.getImageList = function(req, res) {
  // If User is ROLE ADMIN they will get all images Available
  // IF NOT They will only see their own uploaded images

  // Check User Role
  if (!req.user) {
    return res.status(409).send("Unauthorized");
  }
  if (req.user.role == "admin") {
  console.log(`[INFO] User ${req.user.aid} Role ${req.user.role} Requesting Image List`);
    axios
      .get(`${process.env.IMG_SRV_API}/api/v1/upsrv/list`)
      .then(function(response) {
        return res.status(200).json(response.data);
      })
      .catch(function(err) {
        console.log(`[ERROR] ${err.message}`);
        return res.status(500).json({ error: err.message });
      });
  } else {
    console.log(`[INFO] User ${req.user.aid} Requesting Image List`);
    axios
      .get(`${process.env.IMG_SRV_API}/api/v1/upsrv/user/${req.user.aid}`)
      .then(function(response) {
        return res.status(200).json(response.data);
      })
      .catch(function(err) {
        console.log(`[ERROR] ${err.message}`);
        return res.status(500).json({ error: err.message });
      });
  }
};

module.exports.getImageDetails = async function(req, res) {
  let query = req.params.id;
  console.log(`[INFO] Requesting Resource ID ${query}`);
  await axios
    .get(`${process.env.IMG_SRV_API}/api/v1/upsrv/${query}`)
    .then(function(response) {
      return res.status(200).json(response.data);
    })
    .catch(function(err) {
      console.log(`[ERROR] ${err.message}`);
      return res.status(500).json({ error: err.message });
    });
};

module.exports.removeImageResource = function(req, res) {
  let updatedby = req.user.aid;
  let imageid = req.body.imageid;

  if (!imageid) {
    return res.status(404).send("Oh uh, something went wrong");
  } else {
    console.log(`[INFO] USER ${updatedby} Delete Resource ID ${imageid}`);

    let payload = { aid: updatedby, imageid: imageid };
    axios
      .put(`${process.env.IMG_SRV_API}/api/v1/upsrv/res/del`, payload)
      .then(function(response) {
        return res.status(200).json(response.data);
      })
      .catch(function(err) {
        console.log(`[ERROR] ${err.message}`);
        return res.status(500).json({ error: err.message });
      });
  }
};
