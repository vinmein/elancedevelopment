const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");
const config = require("./config");
const decrypter = require("../server/helpers/decrypter.helper");

const connection = async () => {
  // connect to mongo db

  if (process.env.ENV === "development") {
    mongoose.connect(
      `mongodb://${config.extras.db_host}/${config.extras.db_name}`
    );
  } else {
    mongoose.connect(
      `mongodb://${await decrypter.decrypt(
        config.extras.db_username
      )}:${await decrypter.decrypt(config.extras.db_password)}@${
        config.extras.db_host
      }/${config.extras.db_name}`
    );
  }

  mongoose.connection.on("error", () => {
    throw new Error(`unable to connect to database`);
  });
  return mongoose;
};
module.exports = { connection, mongoose };
