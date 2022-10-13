/* Third party npm */
const express = require("express");

const router = express.Router();

/* Internal modules */
const controller = require("../controllers/temple.controller");
const error = require("../../middleware/validators/error.validator");

router.route("/").get(controller.getTemples);

router.route("/").post(controller.createTemple);

module.exports = router;
