
const models = require("../models/authentication.models");

exports.signin = async (req, res) => {
  var user = ""
  user = await models.signIn(req, res)
  user = user[0]
  if (!user) {
     return res.status(404).send({message: "User Not found." });
  }
  var passwordIsValid = false
  if(user.password==req.body.password){
    passwordIsValid = true
  }
  if (!passwordIsValid) {
    return res.status(401).send({
      accessToken: null,
      message: "Invalid password!"
    });
  }
  const token = await models.createAccessToken(user.users_id, res)
  let refreshToken = await models.createRefresh(user.users_id, res);
  res.status(200).send({
    users_id: user.users_id,
    username: user.username,
    accessToken: token,
    refreshToken: refreshToken
  });
};

exports.refreshToken = async (req, res) => {
  const { refreshToken: requestToken } = req.body;
  if (requestToken == null) {
    return res.status(403).json({message: "Refresh token is required!" });
  }
  try {
    let refreshToken = await models.getRefreshToken(requestToken, res);
    if (!refreshToken) {
      res.status(403).json({message: "Refresh token is not in database!" });
      return;
    }else if(refreshToken=="expire"){
      res.status(403).json({
        message: "Refresh token was expired. Please make a new signin request",
      });
      return;
    }else{
      return res.status(200).json({
        accessToken: refreshToken.accessToken,
        refreshToken: refreshToken.refreshToken,
      });
    }
    
  } catch (err) {
    return res.status(500).send({message: err });
  }
};

exports.register = async (req, res) => {
  if(!req.body.firstname){
      res.status(200).send({response_code:"PHC500", message: "First Name cannot be Null." });
  }else if(!req.body.lastname){
      res.status(200).send({response_code:"PHC500", message: "Last Name cannot be Null." });
  }else if(!req.body.title){
    res.status(200).send({response_code:"PHC500", message: "Title cannot be Null." });
}else if(!req.body.username){
      res.status(200).send({response_code:"PHC500", message: "Username cannot be Null." });
  }else if(!req.body.password){
      res.status(200).send({response_code:"PHC500", message: "Password cannot be Null." });
  }else{
    var userAccount = await models.register(req, res)
    if (!userAccount) {
        res.status(500).send({message: "Internal error." });
    }else{
        res.status(200).send({
            message: "Success",
        });
    }
  }   

};

exports.getProfile = async (req, res) => {
  var returnList = await models.getProfile(req, res)
  if (returnList==false) {
      res.status(404).send({ message: "User not found." });
  }else{
      res.status(200).json({
          message: "Success",
          user_info: returnList["data"]
      });
  }
};

exports.logout = async (req, res) => {
  await models.logout(req, res)
};