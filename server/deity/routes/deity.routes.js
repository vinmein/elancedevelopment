/* Third party npm */
const express = require("express");

const router = express.Router();

/* Internal modules */
const controller = require("../controllers/deity.controller");
const error = require("../../middleware/validators/error.validator");

router.route("/").get(controller.getDeities);

router.route("/").post(controller.createDeity);

router.route("/:deityId").patch(controller.patchDeity);

module.exports = router;
