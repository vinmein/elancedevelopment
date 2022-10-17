/* Third party npm */
const express = require("express");

const router = express.Router();

/* Internal modules */
const controller = require("../controllers/product.controller");

router.route("/").get(controller.getProducts);

router.route("/:entryId").patch(controller.updateProduct);

module.exports = router;
