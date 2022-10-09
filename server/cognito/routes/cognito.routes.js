const express = require("express");

const router = express.Router();
const controller = require("../controllers/cognito.controller");
const user = require("../../middleware/validators/user.validator");
// const userAccessControl = require("../controllers/userAccess.controller");
const error = require("../../middleware/validators/error.validator");

// user.validate("CreateUser"), error.check(),
router.route("/register").post(controller.register);

router.route("/login").post(controller.login);

module.exports = router;
