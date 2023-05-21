const jwt = require("jsonwebtoken");
const config = require("../config/auth.config");
const db = require("../models/dbconnection");
var moment = require('moment');
const { TokenExpiredError } = jwt;

const catchError = (err, res) => {
  if (err instanceof TokenExpiredError) {
    return res.status(200).send({message: "Unauthorized! Access Token was expired!" });
  }
  return res.status(200).send({message: "Unauthorized!" });
}

verifyToken = async (req, res, next) => {
  let token = req.headers["access-token"];
  if (!token) {
    return res.status(403).send({
        message: "No token provided!"
    });
  }else{
    let storeToken = await getAccessToken(token, res);
    if(!storeToken){
      return res.status(403).send({
        message: "Unauthorized access restricted. Please Login again!"
      });
    }else{
      jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
          return catchError(err, res);
        }
        req.users_id = decoded.users_id;
        next();
      });
    }
  }
};

getAccessToken = (refresh_token, res) =>{
  if (refresh_token == null) {
    return res.status(403).json({message: "Access token is required!" });
  }else{
    return new Promise(function(resolve){
      const query = "SELECT token, expire_date, users_id, access_token_id FROM access_token WHERE token=$1 ORDER BY access_token_id DESC LIMIT 1"
      const dataquery = [refresh_token];
      db.query(query, dataquery).then(async (results) => {
        if(results.rows.length>0){
          var time = moment();
          var dateNow = time.format('YYYY-MM-DD HH:mm:ss');
          var rows = results.rows
          if (rows[0].expire_date < dateNow) {
            
            const queryDeleteAccess = "DELETE FROM access_token WHERE access_token_id=$1"
            const dataqueryDelete = [rows[0].access_token_id];
            db.query(queryDeleteAccess, dataqueryDelete)
            resolve("expire")
          }else{
            resolve(rows[0].access_token_id);
          }
        }else{
          resolve()
        }
      }).catch(error => {
        res.status(500).send({
          message: error.message
        });
      });
    })
  }
}

const authentication = {
  verifyToken: verifyToken,
  getAccessToken: getAccessToken,
};
module.exports = authentication;