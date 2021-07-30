const mongoose = require("mongoose");
require("dotenv").config();

/**
 * -------------- DATABASE ----------------
 */

/**
 * Connect to MongoDB Server using the connection string in the `.env` file.  To implement this, place the following
 * string into the `.env` file
 *
 * DB_STRING=mongodb://<user>:<password>@localhost:27017/database_name
 * DB_STRING_PROD=<your production database string>
 */

/* Mongodb database connection string. change it as per your needs. here "mydb" is the name of the database.
 *  You don't need to create DB from mongodb terminal. mongoose create the db automatically.
 */
const db = mongoose.connection;


if(!process.env.NODE_ENV) { 
  console.log(`Environment is Incorrectly Declared. Env settings added ${process.env.NODE_ENV}`); 
}

// Connect to the correct environment database
if (process.env.NODE_ENV === "prod") {
  const uri =
    "mongodb+srv://" +
    process.env.ATLAS_USER_PROD +
    ":" +
    process.env.ATLAS_PASS_PROD +
    "@" +
    process.env.ATLAS_CLUSTER_PROD +
    "/" +
    process.env.ATLAS_DB_PROD +
    "?retryWrites=true&w=majority";

  mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  });

  db.on("error", console.error.bind(console, "connection error:"));
  db.once("open", function callback() {
    console.log("Successfully Connected To MongoDB Production...");
  });
} else {
  const uri =
    "mongodb+srv://" +
    process.env.ATLAS_USER_DEV +
    ":" +
    process.env.ATLAS_PASS_DEV +
    "@" +
    process.env.ATLAS_CLUSTER_DEV +
    "/" +
    process.env.ATLAS_DB_DEV +
    "?retryWrites=true&w=majority";

  mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  });
  db.on("error", console.error.bind(console, "connection error:"));
  db.once("open", function callback() {
    console.log("Successfully Connected To MongoDB Development...");
  });
}

module.exports = db;
