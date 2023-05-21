const controller = require("../controllers/order.controllers");
const authModels = require("../models/authentication.models");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  app.get("/order",
    [
        authModels.verifyToken
    ],
    controller.orderList
  );
  app.post(
    "/order",
    [
        authModels.verifyToken,
    ],
    controller.addOrder
  );
  app.delete(
    "/order/:order_code",
    [
        authModels.verifyToken,
    ],
    controller.cancelOrder
  );

};