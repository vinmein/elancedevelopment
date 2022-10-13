const httpStatus = require("http-status");
const _ = require("lodash");
const service = require("../services/store.service");
const APIError = require("../../helpers/APIError.helper");
const deityService = require("../../deity/services/deity.service");
const templeService = require("../../temple/services/temple.service");
const productService = require("../../products/services/product.service");
const logger = require("../../../config/winston")(module);

function flatten(arr) {
  return arr.reduce((flat, toFlatten) => {
    return flat.concat(
      Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten
    );
  }, []);
}

const fetchVariants = async (ids) => {
  const calls = [];
  ids.forEach((value) => {
    const call = service.getVariants(value);
    calls.push(call);
  });
  const list = await Promise.all(calls);
  const data = [];
  list.forEach((value) => {
    data.push(value.body.variants);
  });

  const final = flatten(data);
  return _.keyBy(final, "product_id");
};

module.exports.getProducts = async (req, res, next) => {
  try {
    // const session = await Shopify.Utils.loadCurrentSession(req, res);
    const products = await service.getProducts();
    // const shopify = service.auth();
    return res.status(httpStatus.OK).send(products);
  } catch (e) {
    return next(
      new APIError(e.message, e.status, true, res.__("system_error"), 0)
    );
  }
};

module.exports.getCollections = async (req, res, next) => {
  try {
    const collections = await service.getCollections();
    if (collections.body && collections.body.collection_listings) {
      const collectionIds = _.map(
        collections.body.collection_listings,
        "collection_id"
      );
      const properties = await templeService.getAll({
        collectionId: { $in: collectionIds },
      });
      const keyBy = _.keyBy(properties, "collectionId");
      const finalData = _.map(collections.body.collection_listings, (value) => {
        const obj = value;
        const props = keyBy[obj.collection_id];
        if (keyBy[obj.collection_id]) {
          obj.detail = props;
        }
        return obj;
      });
      return res.status(httpStatus.OK).send(finalData);
    }
    logger.log({
      level: "info",
      message: `Failed to get the Temple details`,
    });
    return next(
      new APIError(
        "Failed to get the Temple details",
        httpStatus.BAD_REQUEST,
        true,
        res.__("failed_to_create"),
        0
      )
    );

    // const shopify = service.auth();
  } catch (e) {
    return next(
      new APIError(e.message, e.status, true, res.__("system_error"), 0)
    );
  }
};

module.exports.getProductFromCollection = async (req, res, next) => {
  const { params } = req;
  let deityList;
  try {
    const temple = await templeService.get(params);
    if (temple) {
      const productList = await service.getProductByCollection(
        temple.collectionId
      );

      const properties = await deityService.getAll({
        collectionId: temple.collectionId,
      });

      if (properties) {
        deityList = service.proccessDeity(properties);
      }

      if (productList.body && productList.body.products) {
        const map = _.map(productList.body.products, "id");
        const variants = await fetchVariants(map);
        const normalProducts = [];
        const archanaiProducts = [];
        _.map(productList.body.products, (value) => {
          const obj = value;
          if (deityList[obj.id]) {
            obj.deityList = deityList[obj.id];
          }
          if (variants[obj.id]) {
            obj.variants = variants[obj.id];
          }
          const withoutSpaces = value.tags.replace(/ /g, "");
          obj.tags = withoutSpaces.split(",");
          if (obj.tags.indexOf("archanai") > -1) {
            archanaiProducts.push(obj);
          } else {
            normalProducts.push(obj);
          }
        });

        return res
          .status(httpStatus.OK)
          .send({ archanaiProducts, normalProducts });
      }
    }
  } catch (e) {
    return next(
      new APIError(e.message, e.status, true, res.__("system_error"), 0)
    );
  }
};

module.exports.generateProductCache = async (req, res, next) => {
  try {
    const products = await service.getProducts();
    if (products.body && products.body.products) {
      const map = _.map(products.body.products, "id");
      const items = await productService.getAll({ productId: { $in: map } });
      const preCreated = _.keyBy(items, "productId");
      const variants = await fetchVariants(map);
      const final = [];
      _.map(products.body.products, (value) => {
        if (!preCreated[value.id]) {
          const withoutSpaces = value.tags.replace(/ /g, "");
          const tags = withoutSpaces.split(",");
          let isArchanai;
          if (tags.indexOf("archanai") > -1) {
            isArchanai = true;
          } else {
            isArchanai = false;
          }
          const obj = {
            productId: value.id,
            title: value.title,
            image: value.image.src || null,
            tags,
            isArchanai,
            product: value,
          };
          const variant = variants[value.id];
          obj.price = parseInt(variant.price, 10);
          obj.variant = variant;
          obj.weight = variant.title;
          final.push(obj);
        }
      });
      const data = await productService.bulkCreate(final);
      return res.status(httpStatus.OK).send(data);
    }
    return next(
      new APIError(
        "Failed to get the products",
        httpStatus.BAD_REQUEST,
        true,
        res.__("failed_to_get"),
        0
      )
    );
  } catch (e) {
    return next(
      new APIError(e.message, e.status, true, res.__("system_error"), 0)
    );
  }
};

module.exports.updateProductCache = async (req, res, next) => {
  const { params } = req;
  try {
    const item = await productService.get(params);
    if (item) {
      const getData = await service.getProductbyId(params.produtId);
      const variantdata = await service.getVariants(params.produtId);
      if (getData.body.product && variantdata.body.variants) {
        const { product } = getData.body;
        const { variants } = variantdata.body;
        const withoutSpaces = product.tags.replace(/ /g, "");
        const tags = withoutSpaces.split(",");

        const variantByKey = _.keyBy(variants, "product_id");
        const variant = variantByKey[product.id];
        let isArchanai;
        if (tags.indexOf("archanai") > -1) {
          isArchanai = true;
        } else {
          isArchanai = false;
        }
        const obj = {
          title: product.title,
          image: product.image.src || null,
          tags,
          isArchanai,
          product,
          variants: variant,
        };
        obj.price = parseInt(variant.price, 10);
        obj.weight = variant.title;
        const patch = await productService.patch(params, obj);
        return res.status(httpStatus.OK).send(patch);
      }
      return next(
        new APIError(
          "Failed to update the products",
          httpStatus.BAD_REQUEST,
          true,
          res.__("failed_to_update"),
          0
        )
      );
    }
    return next(
      new APIError(
        "Failed to update the products",
        httpStatus.BAD_REQUEST,
        true,
        res.__("failed_to_update"),
        0
      )
    );
  } catch (e) {
    return next(
      new APIError(e.message, e.status, true, res.__("system_error"), 0)
    );
  }
};
