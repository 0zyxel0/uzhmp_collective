require("dotenv").config();
const crypto = require("crypto");
const jsonwebtoken = require("jsonwebtoken");


/**
 * -------------- HELPER FUNCTIONS ----------------
 */

/**
 *
 * @param {*} password - The plain text password
 * @param {*} hash - The hash stored in the database
 * @param {*} salt - The salt stored in the database
 *
 * This function uses the crypto library to decrypt the hash using the salt and then compares
 * the decrypted hash/salt with the password that the user provided at login
 */
function validPassword(password, hash, salt) {
  const hashVerify = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");
  return hash === hashVerify;
}

/**
 *
 * @param {*} password - The password string that the user inputs to the password field in the register form
 *
 * This function takes a plain text password and creates a salt and hash out of it.  Instead of storing the plaintext
 * password in the database, the salt and hash are stored for security
 *
 * ALTERNATIVE: It would also be acceptable to just use a hashing algorithm to make a hash of the plain text password.
 * You would then store the hashed password in the database and then re-hash it to verify later (similar to what we do here)
 */
function genPassword(password) {
  var salt = crypto.randomBytes(32).toString("hex");
  var genHash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");

  return {
    salt: salt,
    hash: genHash
  };
}

/**
 * @param {String} user - The user object.  We need this to set the JWT `sub` payload property to the MongoDB user ID
 * @param {String} aid  - random unique id for user connections and invitations
 * @param {String} role - Defines the Role of the user
 * @param {String} board - Defines the hashed value of the layout of the user
 * @param {Date} iat - Defines the Time of token
 * 
 */
function issueJWT(user) {
  const _id = user._id;

  //Tells the jwt token will expire in what is indicated
  const expiresIn = process.env.TIME_TO_EXPIRE || "1h";
  // Payload inside the Token Data
  const payload = {
    sub: _id,
    aid: user.aid, 
    username: user.username,
    email: user.email,
    role: user.role, 
    board: user.layout,
    iat:Math.floor(Date.now / 1000)
  };

  const signedToken = jsonwebtoken.sign(payload, process.env.AUTH_PRIV_KEY.replace(/\\n/g, '\n'), {
    expiresIn: expiresIn,
    algorithm: "RS256"
  });

  return {
    token: "Bearer " + signedToken,
    expires: expiresIn
  };
}

module.exports.validPassword = validPassword;
module.exports.genPassword = genPassword;
module.exports.issueJWT = issueJWT;
