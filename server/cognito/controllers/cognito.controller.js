const httpStatus = require("http-status");
const _ = require("lodash");
const service = require("../services/cognito.service");
const profileService = require("../../profile/services/profile.service");
const shopifyCustomer = require("../../shopify/services/customer.service");
const ErrHandler = require("../../../exceptions/errHandler");
const ThrowHandler = require("../../../exceptions/throwHandler");
const Exceptions = require("../../../exceptions/exception");

const { COGNITO_APP_CLIENT_ID, COGNITO_USER_POOL_ID } = process.env;

module.exports.register = async (req, res, next) => {
  const { body } = req;
  const params = {
    ClientId: COGNITO_APP_CLIENT_ID,
    Password: body.password,
    Username: body.username,
    UserAttributes: [
      {
        Name: "name",
        Value: body.name,
      },
    ],
  };
  if (body.email) {
    params.UserAttributes.push({
      Name: "email",
      Value: body.email,
    });
  }
  if (body.phoneNumber) {
    params.UserAttributes.push({
      Name: "phone_number",
      Value: body.phoneNumber,
    });
  }
  try {
    const result = await service.register(params);
    if (result.$metadata.httpStatusCode === 200) {
      // trigger sms or email verification
      const nameDetail = body.name.split(" ");
      const obj = {
        customer: {
          email: body.email,
          first_name: nameDetail[0],
          last_name: nameDetail[1] || " ",
        },
      };
      const customerResponse = await shopifyCustomer.createCustomer(obj);
      const customerId = customerResponse.body.customer.id;

      const payload = {
        userId: result.UserSub,
        fullName: body.name,
        customerId,
      };
      if (result.CodeDeliveryDetails) {
        if (result.CodeDeliveryDetails.AttributeName === "email")
          payload.email = body.email;
        else if (result.CodeDeliveryDetails.AttributeName === "phoneNumber")
          payload.mobileNo = body.phoneNumber;
        else if (result.CodeDeliveryDetails.AttributeName === "name")
          payload.userName = body.name;
      } else {
        payload.userName = body.name;
        if (body.email) {
          payload.email = body.email;
        }
        if (body.phoneNumber) {
          payload.phoneNumber = body.phoneNumber;
        }
      }
      const profile = await profileService.create(payload);
      if (profile) {
        return res.status(httpStatus.CREATED).send(result);
      }
      return res
        .status(httpStatus.BAD_REQUEST)
        .send({ msg: "failed to create user" });
    }
    return res.status(result.$metadata.httpStatusCode).send();
  } catch (e) {
    return next(new ThrowHandler(e));
  }
};

module.exports.Adminlogin = async (req, res, next) => {
  const { body } = req;
  const params = {
    AuthFlow: "ADMIN_USER_PASSWORD_AUTH",
    ClientId: COGNITO_APP_CLIENT_ID,
    UserPoolId: COGNITO_USER_POOL_ID,
    AuthParameters: {
      USERNAME: body.username,
      PASSWORD: body.password,
    },
  };
  try {
    const result = await service.adminLogin(params);
    return res.status(httpStatus.OK).send(result);
  } catch (e) {
    return next(new ThrowHandler(e));
  }
};

module.exports.login = async (req, res, next) => {
  const { body } = req;
  const params = {
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: COGNITO_APP_CLIENT_ID,
    //   UserPoolId: COGNITO_USER_POOL_ID,
    AuthParameters: {
      USERNAME: body.username,
      PASSWORD: body.password,
    },
  };
  try {
    const result = await service.login(params);
    const picked = _.pick(result.claims, ["sub", "scope", "username"]);
    return res
      .status(httpStatus.OK)
      .send({ ...result.authenticationResult, ...picked });
  } catch (e) {
    console.log(e);
    return next(new ThrowHandler(e));
  }
};
