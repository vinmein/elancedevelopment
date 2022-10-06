const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const md5 = require("md5");
const crypto = require("crypto");
const config = require("../../../config/config");
const database = require("../../helpers/db.helper");
const CONSTANTS = require("../../helpers/Constants");
const decrypter = require("../../helpers/decrypter.helper");
const crypt = require("../../helpers/Crypt");
const logger = require("../../../config/winston")(module);
require("../models/users.model");

const Users = mongoose.model("Users");

const signOptions = {
  expiresIn: process.env.TOKEN_EXPIRY || CONSTANTS.TOKEN_EXPIRES_IN.SIGNIN,
};
const refreshSignOptions = {
  expiresIn:
    process.env.REFRESH_TOKEN_EXPIRY || CONSTANTS.TOKEN_EXPIRES_IN.REFRESH,
};

module.exports.createUser = (data) =>
  new Promise((resolve, reject) => {
    database
      .save(Users, data)
      .then((response) => resolve(response))
      .catch((e) => reject(e));
  });

module.exports.generateToken = async (user) => {
  try {
    logger.verbose(`generateToken Service Start`);
    const accessToken = jwt.sign(
      {
        userId: user.userId,
        role: JSON.stringify(user.role),
        regionId: user.regionId || null,
        persona: user.persona,
      },
      await decrypter.decrypt(config.extras.jwt_secret),
      signOptions
    );

    const signature = await crypt.encrypt(accessToken, false);
    const refreshToken = jwt.sign(
      { userId: user.userId, signature },
      await decrypter.decrypt(config.extras.jwt_secret),
      refreshSignOptions
    );
    return { accessToken, refreshToken };
  } catch (e) {
    logger.error(`generateToken Service Error: ${JSON.stringify(e)}`);
    throw e;
  }
};

module.exports.renderToken = async (user) => {
  if (user && "userId" in user) {
    try {
      const tokens = await this.generateToken(user);
      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        regionId: user.regionId || null,
        role: user.role,
        isVerified: user.isVerified,
        isActive: user.isActive,
        userId: user.userId,
        persona: user.persona || [],
      };
    } catch (e) {
      logger.error(`renderToken Service Error: ${JSON.stringify(e)}`);
      return {
        error: e,
      };
    }
  }
  return {
    error: "No User details found",
  };
};

module.exports.login = (obj) => {
  const lookup = {};
  lookup.username = obj.username.toLowerCase();
  return new Promise((resolve, reject) => {
    database
      .getOneDoc(Users, lookup)
      .then((user) => {
        if (!user) {
          return resolve({ error: "No User Found" });
        }
        if (!user.authenticate(obj.password)) {
          return resolve({ error: "Authentication Failed" });
        }
        return resolve(user);
      })
      .catch((err) => reject(err));
  });
};

module.exports.getUsers = (query, skip = 0, limit = 50) =>
  new Promise((resolve, reject) => {
    database
      .list(Users, query, { skip, limit })
      .then((response) => resolve(response))
      .catch((e) => reject(e));
  });

module.exports.getUserbyId = (
  query,
  filter = {
    _id: 0,
    __v: 0,
    hashedPassword: 0,
    salt: 0,
  }
) =>
  new Promise((resolve, reject) => {
    database
      .getOneDoc(Users, query, filter)
      .then((response) => resolve(response))
      .catch((e) => reject(e));
  });

module.exports.updateUser = (query, payload) =>
  new Promise((resolve, reject) => {
    database
      .updateDoc(Users, query, payload)
      .then((response) => resolve(response))
      .catch((e) => reject(e));
  });

module.exports.deleteUser = (query) =>
  new Promise((resolve, reject) => {
    database
      .deleteOne(Users, query)
      .then((response) => resolve(response))
      .catch((e) => reject(e));
  });

module.exports.getCount = async (query = {}) => {
  const count = await Users.countDocuments(query);
  return count;
};

module.exports.makeSalt = () => {
  return crypto.randomBytes(16).toString("base64");
};

module.exports.encryptPassword = (password, saltValue) => {
  if (!password || !saltValue) {
    return "";
  }
  const salt = Buffer.from(saltValue, "base64");
  return crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("base64");
};

module.exports.generatePassword = (password, givenSalt) => {
  const salt = givenSalt || this.makeSalt();
  const hashedPassword = this.encryptPassword(password, salt);
  return { hashedPassword, salt };
};
