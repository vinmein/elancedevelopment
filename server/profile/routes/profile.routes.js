/* Third party npm */
const express = require("express");

const router = express.Router();

/* Internal modules */
const controller = require("../controllers/profile.controller");

/**
 * @apiType POST
 * @apiKey Create Profile
 * @apiPath /api/v1/profile
 * @apiGroup Profile
 * @apiPermission admin,user
 */
router.route("/").post(controller.create);

module.exports = router;
