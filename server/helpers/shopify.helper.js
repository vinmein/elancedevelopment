const Shopify = require("@shopify/shopify-api").Shopify;
const ApiVersion = require("@shopify/shopify-api").ApiVersion;
const DataType = require("@shopify/shopify-api").DataType;
require("dotenv").config();

const { API_KEY, API_SECRET_KEY, SCOPES, SHOP, HOST, HOST_SCHEME } =
  process.env;

Shopify.Context.initialize({
  API_KEY,
  API_SECRET_KEY,
  SCOPES: [SCOPES],
  HOST_NAME: HOST.replace(/https?:\/\//, ""),
  HOST_SCHEME,
  IS_EMBEDDED_APP: false,
  API_VERSION: ApiVersion.July22,
});

const ACTIVE_SHOPIFY_SHOPS = {};

const Graphql = Shopify.Clients.Graphql(
  "temple-2327.myshopify.com",
  process.env.STOREFRONT_ACCESS
);

const Storefront = Shopify.Clients.Storefront(
  "temple-2327.myshopify.com",
  process.env.STOREFRONT_ACCESS
);
module.exports = { Graphql, Storefront, Shopify, DataType };
