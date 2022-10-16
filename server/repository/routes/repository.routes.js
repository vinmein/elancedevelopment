const express = require("express");

const router = express.Router();
const repoControl = require("../controllers/repository.controller");

router.route("/:app/:env/:category/:resourceId").get(repoControl.accessAwsData);

module.exports = router;
