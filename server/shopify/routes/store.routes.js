/* Third party npm */
const express = require("express");

const router = express.Router();

/* Internal modules */
const controller = require("../controllers/store.controller");
const resource = require("../../middleware/validators/resource.validator");
const error = require("../../middleware/validators/error.validator");
const profileUpload = require("../../middleware/profile.multer.disk.middleware");
const antivirus = require("../../middleware/antivirus.middleware");

// router.route("/").get(controller.get);

router.route("/products").get(controller.getProducts);
router.route("/collections").get(controller.getCollections);
router.route("/collections/products").get(controller.getProductFromCollection);

module.exports = router;
