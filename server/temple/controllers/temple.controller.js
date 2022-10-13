const httpStatus = require("http-status");
const service = require("../services/temple.service");
const CONSTANTS = require("../../helpers/Constants");
const APIError = require("../../helpers/APIError.helper");
const logger = require("../../../config/winston")(module);

module.exports.createTemple = async (req, res, next) => {
  const { body } = req;
  try {
    const data = await service.create(body);
    if (data) {
      return res
        .status(httpStatus.CREATED)
        .json({ msg: "Successfully Created" });
    }
    logger.log({
      level: "info",
      message: `Failed to Created Temple`,
    });
    return next(
      new APIError(
        "Failed to Created Temple",
        httpStatus.BAD_REQUEST,
        true,
        res.__("failed_to_create"),
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

module.exports.getTemples = async (req, res, next) => {
  const { query } = req;
  try {
    const data = await service.getAll(query);
    if (data) {
      return res.status(httpStatus.CREATED).json(data);
    }
    logger.log({
      level: "info",
      message: `Failed to fetch Temples`,
    });
    return next(
      new APIError(
        "Failed to fetch Temples",
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
