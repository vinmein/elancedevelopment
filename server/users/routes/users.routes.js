const express = require("express");

const router = express.Router();
const userControl = require("../controllers/users.controller");
const user = require("../../middleware/validators/user.validator");
const userAccessControl = require("../controllers/userAccess.controller");
const error = require("../../middleware/validators/error.validator");
const verifyToken = require("../../middleware/verifyRefreshToken.middleware");

/**
 * @apiType GET
 * @apiKey Get Post
 * @apiPath /api/v1/post
 * @apiGroup Post
 * @apiPermission ADMIN,MANAGER,ROOT
 */
router.route("/").get(userControl.getUsers);

router
  .route("/:userId")
  .get(
    user.validate("GetByUserID"),
    error.check(),
    userControl.getUserByUserId
  );

/**
 * @apiType POST
 * @apiKey Create post
 * @apiPath /api/v1/post
 * @apiGroup Post
 * @apiPermission admin,moderator,user
 */
router
  .route("/")
  .post(user.validate("CreateUser"), error.check(), userControl.createUser);

router
  .route("/auth")
  .post(user.validate("ConsumerAuth"), error.check(), userControl.login);

router
  .route("/auth/refreshToken")
  .post(
    verifyToken.refreshToken(),
    user.validate("RefreshToken"),
    error.check(),
    userControl.refreshToken
  );

router
  .route("/:userId")
  .delete(user.validate("DeleteUsers"), error.check(), userControl.deleteUser);

router
  .route("/:userId")
  .patch(user.validate("PatchUsers"), error.check(), userControl.updateUser);

router.route("/access/logout").patch(userAccessControl.logout);

router.route("/verification/email").get(userControl.resendEmail);

router.route("/verify/account").post(userControl.accountVerify);

module.exports = router;

/**
 * @apiType DELETE
 * @apiKey Delete Post
 * @apiPath /api/v1/post/:id
 * @apiGroup Post
 * @apiPermission admin,moderator,user
 */
