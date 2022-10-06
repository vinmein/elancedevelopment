/* Third party npm */
const express = require("express");

const router = express.Router();

/* Internal modules */
const controller = require("../controllers/profile.controller");
const resource = require("../../middleware/validators/resource.validator");
const error = require("../../middleware/validators/error.validator");
const profileUpload = require("../../middleware/profile.multer.disk.middleware");
const antivirus = require("../../middleware/antivirus.middleware");


// router.route("/").get(controller.get);

router.route("/").patch(controller.patch);


router
  .route("/image")
  .patch(
    profileUpload.single("file"),
    resource.validate("createResource"),
    error.check(),
    antivirus.viruscheck(),
    controller.uploadImage
  );
module.exports = router;
