const { Shopify, DataType } = require("../../helpers/shopify.helper");

module.exports.createCustomer = async (payload) => {
  const client = new Shopify.Clients.Rest(
    process.env.SHOP,
    process.env.ADMIN_ACCESS
  );
  //
  const response = await client.post({
    path: "customers",
    data: payload,
    type: DataType.JSON,
  });
  return response;
};
