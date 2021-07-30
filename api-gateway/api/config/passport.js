
require("dotenv").config();
const UserSchema = require("../models/User");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const PUB_KEY = process.env.AUTH_PUB_KEY.replace(/\\n/g, '\n');
const logger = require("../logger");
// JWT Options that creates the hash ,salt and signature
const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: PUB_KEY || process.env.AUTH_PUB_KEY.replace(/\\n/g, '\n'),
  algorithms: ["RS256"]
};

// app.js will pass the global passport object here, and this function will configure it
module.exports = passport => {
  // The JWT payload is passed into the verify callback
  passport.use(
    new JwtStrategy(options, function(jwt_payload, done) {
      logger.info(`[passport] Checking Token`);
      // console.log(jwt_payload);
      // We will assign the `sub` property on the JWT to the database ID of user

      // We will then exclude the _id, hash and salt fields
      UserSchema.findOne(
        { _id: jwt_payload.sub },
        { hash: 0, salt: 0, _id: 0 }, 
        function(err, user) {
          if (err) {
            logger.error(err.message);
            return done(err, false);
          }
          if (user) {
            return done(null, user);
          } else {
            return done(null, false);
          }
        }
      );
    })
  );
};
