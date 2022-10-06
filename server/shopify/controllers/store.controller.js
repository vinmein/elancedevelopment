const Shopify = require("@shopify/shopify-api").Shopify;
const httpStatus = require("http-status");
const service = require("../services/store.service");
const CONSTANTS = require("../../helpers/Constants");
const APIError = require("../../helpers/APIError.helper");
const resourceService = require("../../resources/services/resources.service");
const logger = require("../../../config/winston")(module);

module.exports.getProducts = async (req, res, next) => {
  const { body, user } = req;
  try {
    // const session = await Shopify.Utils.loadCurrentSession(req, res);
    const products = await service.getProducts();
    // const shopify = service.auth();
    return res.status(httpStatus.OK).send(products);
  } catch (e) {
    return next(
      new APIError(e.message, e.status, true, res.__("system_error"), 0)
    );
  }
};

module.exports.getCollections = async (req, res, next) => {
  const { body, user } = req;
  try {
    const collections = await service.getCollections();
    // const shopify = service.auth();
    return res.status(httpStatus.OK).send(collections);
  } catch (e) {
    return next(
      new APIError(e.message, e.status, true, res.__("system_error"), 0)
    );
  }
};

module.exports.getProductFromCollection = async (req, res, next) => {
  const { body, user, query } = req;
  try {
    const productList = await service.getProductByCollection(
      query.collectionId
    );
    // const shopify = service.auth();
    return res.status(httpStatus.OK).send(productList);
  } catch (e) {
    return next(
      new APIError(e.message, e.status, true, res.__("system_error"), 0)
    );
  }
};
