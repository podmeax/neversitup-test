const controller = require("../controllers/product.controllers");
const authModels = require("../models/authentication.models");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  app.get("/product",
    [
        authModels.verifyToken
    ],
    controller.productList
  );

};