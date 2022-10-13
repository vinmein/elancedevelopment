const _ = require("lodash");
const { Shopify } = require("../../helpers/shopify.helper");

module.exports.getProducts = async () => {
  const client = new Shopify.Clients.Rest(
    process.env.SHOP,
    process.env.ADMIN_ACCESS
  );
  const product = await client.get({
    path: `products`,
  });
  return product;
};

module.exports.getProductbyId = async (id) => {
  const client = new Shopify.Clients.Rest(
    process.env.SHOP,
    process.env.ADMIN_ACCESS
  );
  const product = await client.get({
    path: `products/${id}`,
  });
  return product;
};

module.exports.getCollections = async () => {
  const client = new Shopify.Clients.Rest(
    process.env.SHOP,
    process.env.ADMIN_ACCESS
  );
  const product = await client.get({
    path: `collection_listings`,
    limit: 100,
  });
  return product;
};

module.exports.getProductByCollection = async (collectionId) => {
  const client = new Shopify.Clients.Rest(
    process.env.SHOP,
    process.env.ADMIN_ACCESS
  );
  const product = await client.get({
    path: `collections/${collectionId}/products`,
    limit: 100,
  });
  return product;
};

module.exports.getVariants = async (productId) => {
  const client = new Shopify.Clients.Rest(
    process.env.SHOP,
    process.env.ADMIN_ACCESS
  );
  const product = await client.get({
    path: `products/${productId}/variants`,
    limit: 50,
  });
  return product;
};

module.exports.proccessDeity = (list) => {
  const obj = {};
  _.map(list, (value) => {
    _.map(value.archanai, (archanai) => {
      if (!(archanai in obj)) {
        obj[archanai] = [];
      }
      obj[archanai].push(value);
    });
  });
  return obj;
};
