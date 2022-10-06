require("dotenv").config();
const express = require("express");
const protectConfig = require("protect-config");
const config = require("./config/config");
const logger = require("./config/winston")(module);

const env = process.env.NODE_ENV || process.env.ENV || "development";
if (env !== "development") {
  const envConfig = `./config/${env}.js`;
  protectConfig.init(envConfig, null, config.extras.key);
}
const { connection } = require("./config/persistance");

try {
  connection();
} catch (e) {
  logger.error({
    level: "info",
    message: `Express server listening on port ${config.port}`,
  });
}
const app = express();

// app.use(configuration.config);

module.exports = require("./config/express")(app, config);

app.listen(config.port, () => {
  logger.log({
    level: "info",
    message: `Express server listening on port ${config.port}`,
  });
});
