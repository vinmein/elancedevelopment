const _ = require("lodash");
const $ = require("mongo-dot-notation");
const httpStatus = require("http-status");
const jwtDecode = require("jwt-decode");
const toonavatar = require("cartoon-avatar");
const md5 = require("md5");
const userService = require("../services/users.service");
const userAccessService = require("../services/userAccess.service");
const profileService = require("../../Profile/services/profile.service");
// const accVerifyService = require("../../accountVerification/services/accVerification.service");
const APIError = require("../../helpers/APIError.helper");
const logger = require("../../../config/winston")(module);
const CONSTANTS = require("../../helpers/Constants");
const helpers = require("../../helpers/helpers");
const config = require("../../../config/config");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * path:
 *  /users/:
 *    post:
 *      summary: Create a new user
 *      tags: [Users]
 *      security:
 *        - Bearer: []
 *      consumes:
 *        - "application/json"
 *        - "application/xml"
 *      produces:
 *      - "application/xml"
 *      - "application/json"
 *      parameters:
 *      - name: "Authorization"
 *        in: "header"
 *        required: true
 *        type: "string"
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CreateUserRequest'
 *      responses:
 *        "200":
 *          description: A user schema
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/CreateUserResponse'
 */

module.exports.createUser = (req, res, next) => {
  const { body } = req;
  body.username = body.username.toLowerCase();
  if (
    body.role.indexOf("ROOT") > -1 &&
    typeof body.regionId === "string" &&
    !body.regionId
  ) {
    const code = `Err${CONSTANTS.MODULE_CODE.USER}${CONSTANTS.OPERATION_CODE.CREATE}${CONSTANTS.ERROR_TYPE.GENERIC}1`;

    logger.log({
      level: "info",
      message: `Missing regionId ${code}`,
    });
    return next(
      new APIError(
        "Missing region Id",
        httpStatus.NOT_FOUND,
        true,
        res.__("missing_parameter_in_body"),
        code
      )
    );
  }
  return userService
    .createUser(body)
    .then(async (response) => {
      if ("userId" in response) {
        const url = toonavatar.generate_avatar({ gender: body.gender });
        const profileImage = await helpers.fetchBase64(url);
        const profile = await profileService.create({
          userId: response.userId,
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email,
          profileImage,
          type: "ADMIN",
        });

        const userResponse = helpers.omitFields(response.toObject(), [
          "hashedPassword",
          "salt",
          "_id",
        ]);
        return res
          .status(httpStatus.CREATED)
          .json({ ...userResponse, ...profile.toObject() });
      }
      const code = `Err${CONSTANTS.MODULE_CODE.USER}${CONSTANTS.OPERATION_CODE.CREATE}${CONSTANTS.ERROR_TYPE.GENERIC}2`;
      logger.log({
        level: "info",
        message: `Failed to Create User ${code}`,
      });
      return next(
        new APIError(
          "Failed to Create User",
          httpStatus.UNPROCESSABLE_ENTITY,
          true,
          res.__("failed_to_create"),
          code
        )
      );
    })
    .catch((e) => {
      const code = `Err${CONSTANTS.MODULE_CODE.USER}${CONSTANTS.OPERATION_CODE.CREATE}${CONSTANTS.ERROR_TYPE.SYSTEM}1`;
      return next(
        new APIError(e.message, e.status, true, res.__("system_error"), code)
      );
    });
};

/**
 * @swagger
 * path:
 *  /users/:
 *    post:
 *      summary: Create a new user
 *      tags: [Users]
 *      security:
 *        - Bearer: []
 *      consumes:
 *        - "application/json"
 *        - "application/xml"
 *      produces:
 *      - "application/xml"
 *      - "application/json"
 *      parameters:
 *      - name: "Authorization"
 *        in: "header"
 *        required: true
 *        type: "string"
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CreateUserRequest'
 *      responses:
 *        "200":
 *          description: A user schema
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/CreateUserResponse'
 */

module.exports.createVisitors = (req, res, next) => {
  const { body } = req;
  body.username = body.username.toLowerCase();
  body.role = ["USER", "VISITORS"];
  try {
    if (
      body.role.indexOf("ROOT") > -1 &&
      typeof body.regionId === "string" &&
      !body.regionId
    ) {
      const code = `Err${CONSTANTS.MODULE_CODE.USER}${CONSTANTS.OPERATION_CODE.CREATE}${CONSTANTS.ERROR_TYPE.GENERIC}1`;

      logger.log({
        level: "info",
        message: `Missing regionId ${code}`,
      });
      return next(
        new APIError(
          "Missing region Id",
          httpStatus.NOT_FOUND,
          true,
          res.__("missing_parameter_in_body"),
          code
        )
      );
    }
    body.cardArt = `${config.extras.base_url}/resources/${CONSTANTS.CARDART_KEY}`;
    return userService
      .createUser(body)
      .then(async (result) => {
        const response = result.toObject();
        if ("userId" in response) {
          const url = toonavatar.generate_avatar({ gender: body.gender });
          const profileImage = await helpers.fetchBase64(url);
          const profile = await profileService.create({
            userId: response.userId,
            firstName: body.firstName,
            lastName: body.lastName,
            gender: body.gender,
            type: "VISITOR",
            email: body.email,
            profileImage,
          });

          // const mailStatus = await accVerifyService.sendVerificationEmail(
          //   profile
          // );
          response.mail = {
            msg: "Verification Email failed to send",
            status: false,
          };

          if (mailStatus.statusCode === 202) {
            response.mail.msg = "Verification Email has been sent successfully";
            response.mail.status = true;
          }
          const userResponse = helpers.omitFields(response, [
            "hashedPassword",
            "salt",
            "_id",
          ]);
          return res
            .status(httpStatus.CREATED)
            .json({ ...userResponse, ...profile.toObject() });
        }
        const code = `Err${CONSTANTS.MODULE_CODE.USER}${CONSTANTS.OPERATION_CODE.CREATE}${CONSTANTS.ERROR_TYPE.GENERIC}2`;
        logger.log({
          level: "info",
          message: `Failed to Create User ${code}`,
        });
        return next(
          new APIError(
            "Failed to Create User",
            httpStatus.UNPROCESSABLE_ENTITY,
            true,
            res.__("failed_to_create"),
            code
          )
        );
      })
      .catch((e) => {
        const code = `Err${CONSTANTS.MODULE_CODE.USER}${CONSTANTS.OPERATION_CODE.CREATE}${CONSTANTS.ERROR_TYPE.SYSTEM}1`;
        return next(
          new APIError(e.message, e.status, true, res.__("system_error"), code)
        );
      });
  } catch (e) {
    const code = `Err${CONSTANTS.MODULE_CODE.USER}${CONSTANTS.OPERATION_CODE.CREATE}${CONSTANTS.ERROR_TYPE.SYSTEM}TC`;
    return next(
      new APIError(e.message, e.status, true, res.__("system_error"), code)
    );
  }
};

/**
 * @swagger
 * path:
 *  /users/:
 *    post:
 *      summary: Create a new user
 *      tags: [Users]
 *      security:
 *        - Bearer: []
 *      consumes:
 *        - "application/json"
 *        - "application/xml"
 *      produces:
 *      - "application/xml"
 *      - "application/json"
 *      parameters:
 *      - name: "Authorization"
 *        in: "header"
 *        required: true
 *        type: "string"
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CreateUserRequest'
 *      responses:
 *        "200":
 *          description: A user schema
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/CreateUserResponse'
 */

module.exports.createDoctors = (req, res, next) => {
  const { body, user } = req;
  body.username = body.username.toLowerCase();
  body.role = ["USER", "DOCTORS"];
  if (
    body.role.indexOf("ROOT") > -1 &&
    typeof body.regionId === "string" &&
    !body.regionId
  ) {
    const code = `Err${CONSTANTS.MODULE_CODE.USER}${CONSTANTS.OPERATION_CODE.CREATE}${CONSTANTS.ERROR_TYPE.GENERIC}1`;

    logger.log({
      level: "info",
      message: `Missing regionId ${code}`,
    });
    return next(
      new APIError(
        "Missing region Id",
        httpStatus.NOT_FOUND,
        true,
        res.__("missing_parameter_in_body"),
        code
      )
    );
  }
  body.cardArt = `${config.extras.base_url}/resources/${CONSTANTS.CARDART_KEY}`;
  return userService
    .createUser(body)
    .then(async (response) => {
      if ("userId" in response) {
        const url = toonavatar.generate_avatar({ gender: body.gender });
        const profileImage = await helpers.fetchBase64(url);
        const profile = await profileService.create({
          userId: response.userId,
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email,
          gender: body.gender,
          type: "DOCTOR",
          profileImage,
        });
        const qualify = {};
        qualify.userId = response.userId;
        // const mailStatus = await accVerifyService.sendVerificationEmail(
        //   profile
        // );
        response.mail = {
          msg: "Verification Email failed to send",
          status: false,
        };

        if (mailStatus.statusCode === 202) {
          response.mail.msg = "Verification Email has been sent successfully";
          response.mail.status = true;
        }
        const userResponse = helpers.omitFields(response.toObject(), [
          "hashedPassword",
          "salt",
          "_id",
        ]);
        return res
          .status(httpStatus.CREATED)
          .json({ ...userResponse, ...profile.toObject() });
      }
      const code = `Err${CONSTANTS.MODULE_CODE.USER}${CONSTANTS.OPERATION_CODE.CREATE}${CONSTANTS.ERROR_TYPE.GENERIC}2`;
      logger.log({
        level: "info",
        message: `Failed to Create User ${code}`,
      });
      return next(
        new APIError(
          "Failed to Create User",
          httpStatus.UNPROCESSABLE_ENTITY,
          true,
          res.__("failed_to_create"),
          code
        )
      );
    })
    .catch((e) => {
      const code = `Err${CONSTANTS.MODULE_CODE.USER}${CONSTANTS.OPERATION_CODE.CREATE}${CONSTANTS.ERROR_TYPE.SYSTEM}1`;
      return next(
        new APIError(e.message, e.status, true, res.__("system_error"), code)
      );
    });
};
/**
 * @swagger
 * path:
 *  /users/:
 *    get:
 *      summary: Get all users
 *      tags: [Users]
 *      parameters:
 *      - name: "Authorization"
 *        in: "header"
 *        required: true
 *        type: "string"
 *      responses:
 *        "200":
 *          description: A user schema
 *          content:
 *            application/json:
 *              schema:
 *                type: "array"
 *                items:
 *                  $ref: '#/components/schemas/GetUserResponse'
 *      security:
 *      - petstore_auth:
 *        - "write:pets"
 *        - "read:pets"
 */

module.exports.getUsers = async (req, res, next) => {
  const { query } = req;
  const { limit, skip, page } = query;
  const payload = _.omit(query, ["limit", "skip", "page"]);
  if ("role" in payload) {
    payload.role = {
      $in: [payload.role],
    };
  }
  const counts = await helpers.pager(
    limit,
    skip,
    page,
    await userService.getCount(payload)
  );
  const { itemCount, currentPage, totalPages } = counts;
  userService
    .getUsers(payload)
    .then((response) => {
      return res
        .status(httpStatus.OK)
        .json({ response, itemCount, currentPage, totalPages });
    })
    .catch((e) => {
      const code = `Err${CONSTANTS.MODULE_CODE.USER}${CONSTANTS.OPERATION_CODE.READ}${CONSTANTS.ERROR_TYPE.SYSTEM}1`;
      return next(
        new APIError(e.message, e.status, true, res.__("system_error"), code)
      );
    });
};

/**
 * @swagger
 * path:
 *  /users/{userId}:
 *    get:
 *      summary: Get User by userId
 *      tags: [Users]
 *      responses:
 *        "200":
 *          description: A user schema
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/GetUserResponse'
 */

module.exports.getUserByUserId = (req, res, next) => {
  const { params, user } = req;
  if (params.userId === "me") {
    params.userId = user.userId;
  }

  userService
    .getUserbyId(params)
    .then(async (response) => {
      if (response && "userId" in response) {
        const profileResponse = await profileService.get({
          userId: response.userId,
        });
        const profile = profileResponse ? profileResponse.toObject() : null;
        const obj = { ...profile, ...response.toObject() };
        return res.status(httpStatus.OK).json(obj);
      }
      const code = `Err${CONSTANTS.MODULE_CODE.USER}${CONSTANTS.OPERATION_CODE.READ}${CONSTANTS.ERROR_TYPE.GENERIC}1`;
      logger.log({
        level: "info",
        message: `Failed to Get User by userId ${code}`,
      });
      return next(
        new APIError(
          "Failed to Get User by userId",
          httpStatus.NOT_FOUND,
          true,
          res.__("failed_to_get"),
          code
        )
      );
    })
    .catch((e) => {
      const code = `Err${CONSTANTS.MODULE_CODE.USER}${CONSTANTS.OPERATION_CODE.READ}${CONSTANTS.ERROR_TYPE.SYSTEM}1`;
      return next(
        new APIError(e.message, e.status, true, res.__("system_error"), code)
      );
    });
};

/**
 * @swagger
 * path:
 *  /users/consumer/auth:
 *    post:
 *      summary: Authenticate Consumers
 *      tags: [Users]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ConsumerAuthRequest'
 *      responses:
 *        "200":
 *          description: A user schema
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ConsumerAuthResponse'
 */

module.exports.login = (req, res, next) => {
  const { body } = req;
  const deviceInfo = req.header("user-agent");
  userService
    .login(body)
    .then(async (response) => {
      if (response && "userId" in response) {
        const profileResponse = await profileService.get({
          userId: response.userId,
        });
        const profile = profileResponse ? profileResponse.toObject() : null;
        const token = await userService.renderToken({
          ...response.toObject(),
          ...profile,
        });

        if (token && "accessToken" in token) {
          await userAccessService.createAccess({
            userId: response.userId,
            sessions: [
              {
                deviceInfo,
                accessToken: token.accessToken,
                refreshToken: token.refreshToken,
              },
            ],
          });

          return res.status(httpStatus.OK).json(token);
        }
        const code = `Err${CONSTANTS.MODULE_CODE.USER}${CONSTANTS.OPERATION_CODE.AUTH}${CONSTANTS.ERROR_TYPE.GENERIC}1`;
        logger.log({
          level: "info",
          message: `Token Generation failed ${code}`,
        });
        return next(
          new APIError(
            "Token Generation failed, Please try again later",
            httpStatus.UNPROCESSABLE_ENTITY,
            true,
            res.__("generation_failed"),
            code
          )
        );
      }
      const code = `Err${CONSTANTS.MODULE_CODE.USER}${CONSTANTS.OPERATION_CODE.AUTH}${CONSTANTS.ERROR_TYPE.GENERIC}1`;
      logger.log({
        level: "info",
        message: `Authentication Failed ${code}`,
      });
      return next(
        new APIError(
          "Authentication failed, Please check your login credentials",
          httpStatus.UNPROCESSABLE_ENTITY,
          true,
          res.__("authentication_failed"),
          code
        )
      );
    })
    .catch((e) => {
      const code = `Err${CONSTANTS.MODULE_CODE.USER}${CONSTANTS.OPERATION_CODE.AUTH}${CONSTANTS.ERROR_TYPE.SYSTEM}1`;
      return next(
        new APIError(e.message, e.status, true, res.__("system_error"), code)
      );
    });
};

/**
 * @swagger
 * path:
 *  /users/admin/auth:
 *    post:
 *      summary: Authenticate Admin Users
 *      tags: [Users]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/AdminAuthRequest'
 *      responses:
 *        "200":
 *          description: A user schema
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/AdminAuthResponse'
 */

module.exports.adminLogin = (req, res, next) => {
  const { body } = req;
  userService
    .login(body)
    .then((response) => {
      if (response && "token" in response) {
        return res.status(httpStatus.OK).json(response);
      }
      const code = `Err${CONSTANTS.MODULE_CODE.USER}${CONSTANTS.OPERATION_CODE.AUTH}${CONSTANTS.ERROR_TYPE.GENERIC}1`;
      logger.log({
        level: "info",
        message: `Authentication Failed ${code}`,
      });
      return next(
        new APIError(
          "Authentication failed, Please check your login credentials",
          httpStatus.UNPROCESSABLE_ENTITY,
          true,
          res.__("authentication_failed"),
          code
        )
      );
    })
    .catch((e) => {
      const code = `Err${CONSTANTS.MODULE_CODE.USER}${CONSTANTS.OPERATION_CODE.AUTH}${CONSTANTS.ERROR_TYPE.SYSTEM}1`;
      return next(
        new APIError(e.message, e.status, true, res.__("system_error"), code)
      );
    });
};

/**
 * @swagger
 * path:
 *  /users/auth/refreshToken:
 *    post:
 *      summary: Refresh Authorization Token api
 *      tags: [Users]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/RefreshTokenRequest'
 *      responses:
 *        "200":
 *          description: A user schema
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/RefreshTokenResponse'
 */

module.exports.refreshToken = async (req, res, next) => {
  const { body } = req;
  const noBearer = body.accessToken.replace("Bearer ", "");
  const noBearerRefresh = body.refreshToken.replace("Bearer ", "");
  if (noBearer && noBearer !== "undefined") {
    let decodedToken;

    try {
      decodedToken = jwtDecode(body.refreshToken);
    } catch (e) {
      const code = `Err${CONSTANTS.MODULE_CODE.USER}${CONSTANTS.OPERATION_CODE.AUTH}${CONSTANTS.ERROR_TYPE.GENERIC}4`;
      return next(
        new APIError(
          "Invalid refresh token",
          httpStatus.UNPROCESSABLE_ENTITY,
          true,
          res.__("invalid_token"),
          code
        )
      );
    }

    if (!("signature" in decodedToken)) {
      const code = `Err${CONSTANTS.MODULE_CODE.USER}${CONSTANTS.OPERATION_CODE.AUTH}${CONSTANTS.ERROR_TYPE.GENERIC}2`;
      return next(
        new APIError(
          "Signature not found, please use the correct access token & refresh token",
          httpStatus.UNPROCESSABLE_ENTITY,
          true,
          res.__("signature_error"),
          code
        )
      );
    }

    if (decodedToken.signature !== md5(noBearer)) {
      const code = `Err${CONSTANTS.MODULE_CODE.USER}${CONSTANTS.OPERATION_CODE.AUTH}${CONSTANTS.ERROR_TYPE.GENERIC}3`;
      return next(
        new APIError(
          "Signature mismatch, please use the correct access token & refresh token",
          httpStatus.UNPROCESSABLE_ENTITY,
          true,
          res.__("signature_error"),
          code
        )
      );
    }
    try {
      const query = {
        sessions: {
          $elemMatch: { refreshToken: noBearerRefresh, status: true },
        },
        isBlocked: false,
      };
      const access = await userAccessService.getAccessData(query);
      if (access != null) {
        const user = await userService.getUserbyId({
          userId: decodedToken.userId,
        });
        if (user && "userId" in user) {
          const renderToken = await userService.generateToken(user);
          const deviceInfo = req.header("user-agent");

          await userAccessService.patch(
            {
              sessions: { $elemMatch: { deviceInfo } },
            },
            {
              $set: {
                "sessions.$.accessToken": renderToken.accessToken,
                "sessions.$.refreshToken": renderToken.refreshToken,
              },
            }
          );
          return res.status(httpStatus.CREATED).send(renderToken);
        }
        const code = `Err${CONSTANTS.MODULE_CODE.USER}${CONSTANTS.OPERATION_CODE.AUTH}${CONSTANTS.ERROR_TYPE.GENERIC}5`;
        return next(
          new APIError(
            "User details not found",
            httpStatus.NOT_FOUND,
            true,
            res.__("not_found"),
            code
          )
        );
      }
      const code = `Err${CONSTANTS.MODULE_CODE.USER}${CONSTANTS.OPERATION_CODE.AUTH}${CONSTANTS.ERROR_TYPE.GENERIC}5`;
      return next(
        new APIError(
          "User Access Details not found",
          httpStatus.NOT_FOUND,
          true,
          res.__("not_found"),
          code
        )
      );
    } catch (e) {
      const code = `Err${CONSTANTS.MODULE_CODE.USER}${CONSTANTS.OPERATION_CODE.AUTH}${CONSTANTS.ERROR_TYPE.SYSTEM}1`;
      return next(
        new APIError(e.message, e.status, true, res.__("system_error"), code)
      );
    }
  } else {
    const code = `Err${CONSTANTS.MODULE_CODE.USER}${CONSTANTS.OPERATION_CODE.AUTH}${CONSTANTS.ERROR_TYPE.GENERIC}1`;
    return next(
      new APIError(
        "Invalid Access Token",
        httpStatus.BAD_REQUEST,
        true,
        res.__("invalid_token"),
        code
      )
    );
  }
};

/**
 * @swagger
 * path:
 *  /users/{userId}:
 *    patch:
 *      summary: Update user details
 *      tags: [Users]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/UpdateUserRequest'
 *      responses:
 *        "200":
 *          description: A user schema
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/UpdateUserResponse'
 */
module.exports.updateUser = (req, res, next) => {
  const { params, body, user } = req;
  const omitList = [
    "userId",
    "username",
    "hashedPassword",
    "salt",
    "isPBKDF2",
    "passwordLastReset",
    "isVerified",
  ];
  if (params.userId === "me") {
    params.userId = user.userId;
  }
  if (user.role.indexOf("USER") > -1) {
    omitList.push("role");
  }

  if (params && params.userId) {
    const payload = _.omit(body, omitList);
    if ("role" in payload) {
      payload.role = $.$push(payload.role);
    }

    const flattened = $.flatten(payload);
    userService
      .updateUser(params, flattened)
      .then(async (response) => {
        if (response && "userId" in response) {
          return res.status(httpStatus.OK).json({
            message: "Account has been updated successfully",
          });
        }
        const code = `Err${CONSTANTS.MODULE_CODE.USER}${CONSTANTS.OPERATION_CODE.UPDATE}${CONSTANTS.ERROR_TYPE.GENERIC}2`;
        return next(
          new APIError(
            "Failed to update account details",
            httpStatus.BAD_REQUEST,
            true,
            res.__("update_failed"),
            code
          )
        );
      })
      .catch((e) => {
        const code = `Err${CONSTANTS.MODULE_CODE.USER}${CONSTANTS.OPERATION_CODE.UPDATE}${CONSTANTS.ERROR_TYPE.SYSTEM}1`;
        return next(
          new APIError(e.message, e.status, true, res.__("system_error"), code)
        );
      });
  } else {
    const code = `Err${CONSTANTS.MODULE_CODE.USER}${CONSTANTS.OPERATION_CODE.UPDATE}${CONSTANTS.ERROR_TYPE.GENERIC}1`;
    next(
      new APIError(
        "UserId not found",
        httpStatus.NOT_FOUND,
        true,
        res.__("not_found"),
        code
      )
    );
  }
};

/**
 * @swagger
 * path:
 *  /users/{userId}:
 *    delete:
 *      summary: delete user details
 *      tags: [Users]
 *      parameters:
 *      - name: "Authorization"
 *        in: "header"
 *        required: true
 *        type: "string"
 *      responses:
 *        "200":
 *          description: A user schema
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/DeleteUserResponse'
 */
module.exports.deleteUser = (req, res, next) => {
  const { params } = req;
  if (params && params.userId) {
    userService
      .deleteUser(params)
      .then((response) => {
        if ("ok" in response && "n" in response && response.n > 0) {
          return res.status(httpStatus.OK).send({
            message: "Account has been deleted successfully",
          });
        }
        const code = `Err${CONSTANTS.MODULE_CODE.USER}${CONSTANTS.OPERATION_CODE.DELETE}${CONSTANTS.ERROR_TYPE.GENERIC}2`;
        logger.log({
          level: "error",
          message: `Failed to delete the account ${code}`,
        });
        return next(
          new APIError(
            "Failed to delete the account",
            httpStatus.BAD_REQUEST,
            true,
            res.__("deletion_failed"),
            code
          )
        );
      })
      .catch((e) => {
        const code = `Err${CONSTANTS.MODULE_CODE.USER}${CONSTANTS.OPERATION_CODE.DELETE}${CONSTANTS.ERROR_TYPE.SYSTEM}1`;
        logger.log({
          level: "info",
          message: e.message,
        });
        next(
          new APIError(e.message, e.status, true, res.__("system_error"), code)
        );
      });
  } else {
    const code = `Err${CONSTANTS.MODULE_CODE.USER}${CONSTANTS.OPERATION_CODE.DELETE}${CONSTANTS.ERROR_TYPE.GENERIC}1`;
    next(
      new APIError(
        "UserId not found",
        httpStatus.NOT_FOUND,
        true,
        res.__("not_found"),
        code
      )
    );
  }
};





module.exports.updatePassword = async (req, res, next) => {
  const { body, user } = req;
  try {
    const userData = await userService.getUserbyId(
      {
        userId: user.userId,
        isActive: true,
      },
      {
        _id: 0,
        __v: 0,
      }
    );
    if (!userData || !userData.userId) {
      const code = `Err${CONSTANTS.MODULE_CODE.USER}${CONSTANTS.OPERATION_CODE.PATCH}${CONSTANTS.ERROR_TYPE.GENERIC}INVALID`;
      return next(
        new APIError(
          "User not found",
          httpStatus.NOT_FOUND,
          true,
          res.__("not_found"),
          code
        )
      );
    }
    const encryptedValue = userService.generatePassword(
      body.oldPassword,
      userData.salt
    );
    if (encryptedValue.hashedPassword !== userData.hashedPassword) {
      const code = `Err${CONSTANTS.MODULE_CODE.USER}${CONSTANTS.OPERATION_CODE.PATCH}${CONSTANTS.ERROR_TYPE.GENERIC}INVALID`;
      return next(
        new APIError(
          "Existing Password is Invalid",
          httpStatus.BAD_REQUEST,
          true,
          res.__("invalid_password"),
          code
        )
      );
    }
    const newEncrypted = userService.generatePassword(body.newPassword);
    const userUpdate = await userService.updateUser(
      { userId: user.userId, isActive: true },
      { $set: newEncrypted }
    );
    if (!userUpdate || !userUpdate.userId) {
      const code = `Err${CONSTANTS.MODULE_CODE.USER}${CONSTANTS.OPERATION_CODE.PATCH}${CONSTANTS.ERROR_TYPE.GENERIC}INVALID`;
      return next(
        new APIError(
          "User not found",
          httpStatus.NOT_FOUND,
          true,
          res.__("not_found"),
          code
        )
      );
    }
    return res
      .status(httpStatus.OK)
      .send({ msg: "Password Updated Successfully" });
  } catch (e) {
    const code = `Err${CONSTANTS.MODULE_CODE.USER}${CONSTANTS.OPERATION_CODE.PATCH}${CONSTANTS.ERROR_TYPE.SYSTEM}RESET`;
    return next(
      new APIError(e.message, e.status, true, res.__("system_error"), code)
    );
  }
};

module.exports.resendEmail = async (req, res, next) => {
  const { user } = req;
  try {
    const userData = await userService.getUserbyId({
      userId: user.userId,
      isActive: false,
    });
    if (!userData || !userData.userId) {
      const code = `Err${CONSTANTS.MODULE_CODE.USER}${CONSTANTS.OPERATION_CODE.PATCH}${CONSTANTS.ERROR_TYPE.GENERIC}INVALID`;
      return next(
        new APIError(
          "User not found",
          httpStatus.NOT_FOUND,
          true,
          res.__("not_found"),
          code
        )
      );
    }
    // const mailStatus = await accVerifyService.sendVerificationEmail(userData);
    if (!mailStatus) {
      const code = `Err${CONSTANTS.MODULE_CODE.USER}${CONSTANTS.OPERATION_CODE.GET}${CONSTANTS.ERROR_TYPE.GENERIC}MAIL`;
      return next(
        new APIError(
          "Failed to Send Mail",
          httpStatus.NOT_FOUND,
          true,
          res.__("failed_to_send"),
          code
        )
      );
    }
    return res.status(httpStatus.OK).send({
      msg: "Verification Email failed to send",
    });
  } catch (e) {
    const code = `Err${CONSTANTS.MODULE_CODE.USER}${CONSTANTS.OPERATION_CODE.PATCH}${CONSTANTS.ERROR_TYPE.SYSTEM}RESET`;
    return next(
      new APIError(e.message, e.status, true, res.__("system_error"), code)
    );
  }
};

module.exports.accountVerify = async (req, res, next) => {
  const { body } = req;
  // try {
  //   const entryStatus = await accVerifyService.getVerifyDetails({
  //     userId: body.userId,
  //     verifyCode: body.code,
  //     status: "ACTIVE",
  //   });
  //   if (!entryStatus || !entryStatus.verifyId) {
  //     const code = `Err${CONSTANTS.MODULE_CODE.USER}${CONSTANTS.OPERATION_CODE.GET}${CONSTANTS.ERROR_TYPE.GENERIC}VERIFY`;
  //     return next(
  //       new APIError(
  //         "Failed to Get Verify Entry",
  //         httpStatus.NOT_FOUND,
  //         true,
  //         res.__("failed_to_get"),
  //         code
  //       )
  //     );
  //   }
  //   const userData = await userService.getUserbyId({
  //     userId: body.userId,
  //     isActive: false,
  //   });
  //   if (!userData || !userData.userId) {
  //     const code = `Err${CONSTANTS.MODULE_CODE.USER}${CONSTANTS.OPERATION_CODE.PATCH}${CONSTANTS.ERROR_TYPE.GENERIC}INVALID`;
  //     return next(
  //       new APIError(
  //         "User not found",
  //         httpStatus.NOT_FOUND,
  //         true,
  //         res.__("not_found"),
  //         code
  //       )
  //     );
  //   }
  //   const userUpdate = await userService.updateUser(
  //     { userId: body.userId, isActive: false },
  //     { $set: { isVerified: true } }
  //   );
  //   if (!userUpdate || !userUpdate.userId) {
  //     const code = `Err${CONSTANTS.MODULE_CODE.USER}${CONSTANTS.OPERATION_CODE.PATCH}${CONSTANTS.ERROR_TYPE.GENERIC}INVALID`;
  //     return next(
  //       new APIError(
  //         "User not found",
  //         httpStatus.NOT_FOUND,
  //         true,
  //         res.__("not_found"),
  //         code
  //       )
  //     );
  //   }
  //   await accVerifyService.updateVerifyEntry(
  //     {
  //       userId: body.userId,
  //       verifyCode: body.code,
  //       status: "ACTIVE",
  //     },
  //     { $set: { status: "INACTIVE" } }
  //   );
  //   return res.status(httpStatus.OK).send({
  //     msg: "Your Account is verified Successfully",
  //   });
  // } catch (e) {
  //   const code = `Err${CONSTANTS.MODULE_CODE.USER}${CONSTANTS.OPERATION_CODE.PATCH}${CONSTANTS.ERROR_TYPE.SYSTEM}RESET`;
  //   return next(
  //     new APIError(e.message, e.status, true, res.__("system_error"), code)
  //   );
  // }
};
