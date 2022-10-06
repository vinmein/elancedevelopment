const fs = require("fs");
const httpStatus = require("http-status");
const _ = require("lodash");
const config = require("../../../config/config");
const $ = require("mongo-dot-notation");
const shortId = require("shortid");

const service = require("../services/profile.service");
const CONSTANTS = require("../../helpers/Constants");
const APIError = require("../../helpers/APIError.helper");
const resourceService = require("../../resources/services/resources.service");
const logger = require("../../../config/winston")(module);

module.exports.patch = async (req, res, next) => {
  const { body, user } = req;
  const payload = _.omit(body, ["userId"]);

  try {
    if (Object.keys(payload).length > 0) {
      const data = await service.patch(
        { userId: user.userId },
        $.flatten(payload)
      );
      if (data) {
        return res.status(httpStatus.OK).json({ msg: "Successfully Updated" });
      }
      const code = `Err${CONSTANTS.MODULE_CODE.SCHEDULER}${CONSTANTS.OPERATION_CODE.UPDATE}${CONSTANTS.ERROR_TYPE.GENERIC}1`;
      logger.log({
        level: "info",
        message: `Failed to Update ${code}`,
      });
      return next(
        new APIError(
          "Failed to Update",
          httpStatus.BAD_REQUEST,
          true,
          res.__("failed_to_create"),
          code
        )
      );
    }
    const code = `Err${CONSTANTS.MODULE_CODE.SCHEDULER}${CONSTANTS.OPERATION_CODE.UPDATE}${CONSTANTS.ERROR_TYPE.GENERIC}CHECK1`;
    logger.log({
      level: "info",
      message: `Dont have permission to update certain details ${code}`,
    });
    return next(
      new APIError(
        "Dont have permission to update certail details",
        httpStatus.BAD_REQUEST,
        true,
        res.__("not_allowed"),
        code
      )
    );
  } catch (e) {
    const code = `Err${CONSTANTS.MODULE_CODE.SCHEDULER}${CONSTANTS.OPERATION_CODE.UPDATE}${CONSTANTS.ERROR_TYPE.SYSTEM}1`;
    return next(
      new APIError(e.message, e.status, true, res.__("system_error"), code)
    );
  }
};


module.exports.uploadImage = (req, res, next) => {
  const { body, file, user, S3 } = req;
  try {
    const sid = shortId.generate();
    const tmpPath = req.safePath;
    const contentType = file.mimetype;
    const image = fs.createReadStream(tmpPath);
    const directory = body.category || "default";
    const type = contentType.split("/");
    const randomName = type.length > 1 ? `${sid}.${type[1]}` : `${sid}.png`;
    const params = {
      Bucket: `${config.extras.aws.bucket}/${config.app.name}/${process.env.ENV}/${directory}`,
      Key: `${randomName}`,
      Body: image,
      ContentType: contentType,
    };
    logger.info(`uploadFile Controller Start: ${JSON.stringify(params)}`);
    resourceService
      .uploadToAWS(S3, params)
      .then(async (resource) => {
        if (resource && "Location" in resource) {
          const payload = {
            fileName: `${resource.Key}`,
            fileType: contentType,
            file: resource,
            createdBy: user.userId,
            category: directory,
            resourceId: sid,
          };
          const savedData = await resourceService.saveToCollection(payload);
          const profileImage = `${config.extras.base_url}/resources/${config.app.name}/${process.env.ENV}/${directory}/${savedData.resourceId}.${type[1]}`

          fs.unlinkSync(req.safePath);


          const data = await service.patch(
            { userId: user.userId },
            { $set: { profileImage } }
          );
          if (!data) {

          }
          return res.status(httpStatus.OK).json({ msg: "Successfully Updated" });
        }
        const code = `Err${CONSTANTS.MODULE_CODE.RESOURCE}${CONSTANTS.OPERATION_CODE.UPLOAD}${CONSTANTS.ERROR_TYPE.GENERIC}1`;
        logger.error(
          `uploadFile Controller Error: Failed to upload resource file`
        );
        return next(
          new APIError(
            "Failed to upload resource file",
            httpStatus.UNPROCESSABLE_ENTITY,
            true,
            res.__("update_failed"),
            code
          )
        );
      })
      .catch((e) => {
        logger.error(`uploadFile Controller Catch: ${JSON.stringify(e)}`);
        const code = `Err${CONSTANTS.MODULE_CODE.RESOURCE}${CONSTANTS.OPERATION_CODE.UPLOAD}${CONSTANTS.ERROR_TYPE.SYSTEM}1`;
        return next(
          new APIError(e.message, e.status, true, res.__("system_error"), code)
        );
      });
  } catch (err) {
    logger.error(`uploadFile Controller Catch: ${JSON.stringify(e)}`);
    const code = `Err${CONSTANTS.MODULE_CODE.RESOURCE}${CONSTANTS.OPERATION_CODE.UPLOAD}${CONSTANTS.ERROR_TYPE.SYSTEM}1`;
    return next(
      new APIError(e.message, e.status, true, res.__("system_error"), code)
    );
  }
};