const controller = require("../controllers/authentication.controllers");
const models = require("../models/authentication.models");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  app.post("/users/login", controller.signin);

  app.post(
    "/register",
    [
      models.verifyToken,
      models.checkDuplicateUsername,
    ],
    controller.register
  );

  app.post("/users/logout", controller.logout);

  app.post("/users/refreshtoken",
    [], 
    controller.refreshToken
  );

  app.get("/profile",
    [
      models.verifyToken
    ],
    controller.getProfile
  );
};