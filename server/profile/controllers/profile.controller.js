const httpStatus = require("http-status");
const { validationResult } = require("express-validator");

const service = require("../services/profile.service");
const shopifyCustomer = require("../../shopify/services/customer.service");
const ErrHandler = require("../../../exceptions/errHandler");
const ThrowHandler = require("../../../exceptions/throwHandler");
const Exceptions = require("../../../exceptions/exception");

module.exports.create = async (req, res, next) => {
  const { user, body } = req;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(
        new ErrHandler({
          exceptions: Exceptions.VALIDATION_ERROR,
          message: "Validation Failed",
        })
      );
    }
    body.type = user["cognito:groups"];
    body.userId = user.sub;
    body.claims = user;
    const response = await service.create(body);
    if (response) {
      const obj = {
        customer: {
          email: req.email,
          first_name: req.firstName,
          last_name: req.lastName,
        },
      };
      const customerResponse = shopifyCustomer.createCustomer();
      const customerId = customerResponse.id;
      console.log(customerId);
    }
    return res.status(httpStatus.CREATED).send(response);
  } catch (e) {
    return next(new ThrowHandler(e));
  }
};
