const httpStatus = require("http-status");

const $ = require("mongo-dot-notation");
const service = require("../services/deity.service");
const CONSTANTS = require("../../helpers/Constants");
const APIError = require("../../helpers/APIError.helper");
const logger = require("../../../config/winston")(module);

module.exports.createDeity = async (req, res, next) => {
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
      message: `Failed to Created Deity`,
    });
    return next(
      new APIError(
        "Failed to Created Deity",
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

module.exports.patchDeity = async (req, res, next) => {
  const { body, params } = req;

  let payload;
  if (typeof body.archanai === "string" || typeof body.archanai === "number") {
    const push = { archanai: body.archanai };
    delete body.archanai;
    payload = $.flatten(body);
    payload.$push = push;
  } else {
    payload = $.flatten(body);
  }

  try {
    const data = await service.patch(params, payload);
    if (data) {
      return res
        .status(httpStatus.CREATED)
        .json({ msg: "Successfully updated" });
    }
    logger.log({
      level: "info",
      message: `Failed to Created Deity`,
    });
    return next(
      new APIError(
        "Failed to Created Deity",
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

module.exports.getDeities = async (req, res, next) => {
  const { query } = req;
  try {
    const data = await service.getAll(query);
    if (data) {
      return res.status(httpStatus.CREATED).json(data);
    }
    logger.log({
      level: "info",
      message: `Failed to fetch Deities`,
    });
    return next(
      new APIError(
        "Failed to fetch Deities",
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
