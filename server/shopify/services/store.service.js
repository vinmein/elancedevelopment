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
