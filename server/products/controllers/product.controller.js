const httpStatus = require("http-status");

const _ = require("lodash");
const service = require("../services/product.service");
const storeService = require("../../shopify/services/store.service");
const deityService = require("../../deity/services/deity.service");
const CONSTANTS = require("../../helpers/Constants");
const APIError = require("../../helpers/APIError.helper");
const logger = require("../../../config/winston")(module);

module.exports.getProducts = async (req, res, next) => {
  const { query } = req;
  if (!query.tags) {
    return next(
      new APIError(
        "Failed to get query",
        httpStatus.BAD_REQUEST,
        true,
        res.__("failed_to_query"),
        0
      )
    );
  }
  if (query.tags) {
    query.tags = { $in: [query.tags] };
  }
  try {
    let deityList;
    const data = await service.getAll(query);
    if (data) {
      const properties = await deityService.getAll({
        templeCode: query.tags,
      });
      console.log(properties);
      if (properties) {
        deityList = storeService.proccessDeity(properties);
      }
      const grouped = _.groupBy(data, "isArchanai");

      const archanaiProducts = _.map(grouped.true, (value) => {
        const obj = value;
        if (deityList[obj.productId]) {
          obj.deityList = deityList[obj.productId];
        }
        return obj;
      });

      return res.status(httpStatus.CREATED).json({
        normalProducts: grouped.false,
        archanaiProducts,
      });
    }
    logger.log({
      level: "info",
      message: `Failed to fetch products`,
    });
    return next(
      new APIError(
        "Failed to fetch products",
        httpStatus.BAD_REQUEST,
        true,
        res.__("failed_to_get"),
        0
      )
    );
  } catch (e) {
    const code = `Err${CONSTANTS.MODULE_CODE.SCHEDULER}${CONSTANTS.OPERATION_CODE.UPDATE}${CONSTANTS.ERROR_TYPE.SYSTEM}1`;
    return next(
      new APIError(e.message, e.status, true, res.__("system_error"), code)
    );
  }
};
