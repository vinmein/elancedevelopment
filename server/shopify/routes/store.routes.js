/* Third party npm */
const express = require("express");

const router = express.Router();

/* Internal modules */
const controller = require("../controllers/store.controller");

router.route("/products").get(controller.getProducts);
router.route("/temples").get(controller.getCollections);
router
  .route("/temples/products/:templeCode")
  .get(controller.getProductFromCollection);

router.route("/temples/products/cache").post(controller.generateProductCache);

router
  .route("/temples/products/cache/:produtId")
  .patch(controller.updateProductCache);

module.exports = router;
