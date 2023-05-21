const jwt = require("jsonwebtoken");
const config = require("../config/auth.config");
const db = require("../models/dbconnection");
var moment = require('moment');
const { v4: uuidv4 } = require("uuid");
const { TokenExpiredError } = jwt;

const catchError = (err, res) => {
  if (err instanceof TokenExpiredError) {
    return res.status(200).send({message: "Unauthorized! Access Token was expired!" });
  }
  return res.status(200).send({message: "Unauthorized!" });
}

checkDuplicateUsername  = (req, res, next) => {
  let query = ""
  let dataquery = ""
  query = "SELECT * FROM users WHERE username=$1 ORDER BY users_id DESC"
  dataquery = [req.body.username];

  db.query(query, dataquery).then((results) => {

    if(results.rows.length>0){
        res.status(200).json({message:"Username already in use"})
    }else{
      next();
    }
  }).catch(error => {
    res.status(500).send({
      response_code:"PHC500",
      response_message: error.message
    });
  });
};


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

signIn = (req, res) =>{
  return new Promise(function(resolve){
    const query = "SELECT password, users_id, username FROM users WHERE UPPER(username)=UPPER($1) AND active=$2 ORDER BY users_id DESC"
    const dataquery = [req.body.username, "T"];
    db.query(query, dataquery).then((results) => {
      if(results.rows.length>0){
        var time = moment();
        var date = time.format('YYYY-MM-DD HH:mm:ss');
        const queryLogin = "UPDATE users SET last_login=$1 WHERE users_id=$2"
        const dataqueryLogin = [date, results.rows[0]['users_id']];
        db.query(queryLogin, dataqueryLogin).then(() => {
          resolve(results.rows)
        })
        .catch(error => {
          res.status(500).send({
            message: error.message
          });
        });
      }else{
        resolve(results.rows)
      }
    })
    .catch(error => {
      res.status(500).send({
        message: error.message
      });
    });
  })
}

createAccessToken = (userId, res) =>{
  let token = jwt.sign({ users_id: userId }, config.secret, {
    expiresIn: config.jwtExpiration
  });
  let expiredAt = new Date();
  expiredAt.setSeconds(expiredAt.getSeconds() + config.jwtExpiration);

  var time = moment();
  var date = time.format('YYYY-MM-DD HH:mm:ss');
  return new Promise(function(resolve){
    const query = "INSERT INTO access_token(token, expire_date, users_id, create_date, update_date) VALUES ($1, $2, $3, $4, $5);"
    const dataquery = [token, expiredAt, userId, date, date];
    db.query(query, dataquery).then(() => {
      const queryDeleteAccess = "DELETE FROM access_token WHERE token!=$1 AND users_id=$2"
      const dataqueryDelete = [token, userId];
      db.query(queryDeleteAccess, dataqueryDelete)

      const queryLogin = "UPDATE users SET last_login=$1 WHERE users_id=$2"
      const dataqueryLogin = [date, userId];
      db.query(queryLogin, dataqueryLogin).then(() => {})

      resolve(token)
    })
    .catch(error => {
      res.status(500).send({
        message: error.message
      });
    });
  })
}

createRefresh = (userId, res)=>{
  let expiredAt = new Date();
  expiredAt.setSeconds(expiredAt.getSeconds() + config.jwtRefreshExpiration);
  let _token = uuidv4();

  var time = moment();
  var date = time.format('YYYY-MM-DD HH:mm:ss');
  return new Promise(function(resolve){
    const query = "INSERT INTO refresh_token(token, expire_date, users_id, create_date, update_date) VALUES ($1, $2, $3, $4, $5);"
    const dataquery = [_token, expiredAt, userId, date, date];
    db.query(query, dataquery).then(() => {
      const queryDeleteRefresh = "DELETE FROM refresh_token WHERE token!=$1 AND users_id=$2"
      const dataqueryDelete = [_token, userId];
      db.query(queryDeleteRefresh, dataqueryDelete)

      var time = moment();
      var date = time.format('YYYY-MM-DD HH:mm:ss');
      const queryLogin = "UPDATE users SET last_login=$1 WHERE users_id=$2"
      const dataqueryLogin = [date, userId];
      db.query(queryLogin, dataqueryLogin).then(() => {})

      resolve(_token)
    })
    .catch(error => {
      res.status(500).send({
        message: error.message
      });
    });
  })
}

getRefreshToken = (refresh_token, res)=>{
  if (refresh_token == null) {
    return res.status(403).json({message: "Refresh Token is required!" });
  }else{
    return new Promise(function(resolve){
      const query = "SELECT token, expire_date, users_id, refresh_token_id FROM refresh_token WHERE token=$1 ORDER BY refresh_token_id DESC LIMIT 1"
      const dataquery = [refresh_token];
      db.query(query, dataquery).then(async (results) => {
        if(results.rows.length>0){
          
          var time = moment();
          var dateNow = time.format('YYYY-MM-DD HH:mm:ss');
          var rows = results.rows
          var users_id = rows[0].users_id
          if (rows[0].expire_date < dateNow) {
            
            const queryDeleteRefresh = "DELETE FROM refresh_token WHERE refresh_token_id=$1"
            const dataqueryDelete = [rows[0].refresh_token_id];
            db.query(queryDeleteRefresh, dataqueryDelete)
            resolve("expire")
          }else{
            let newAccessToken = await createAccessToken(users_id, res)
            let newRefresh = await createRefresh(users_id, res)

            resolve({
              accessToken: newAccessToken,
              refreshToken: newRefresh,
            });
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

function getAccessToken (refresh_token, res){
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

logout = (req, res) => {
  let token = req.headers["access-token"];
  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      res.status(500).send({
        message: err
      });
    }else{
      if(req.body.users_id==decoded.users_id){
        const query = "DELETE FROM refresh_token WHERE users_id=$1"
        const dataquery = [req.body.users_id];
        db.query(query, dataquery)
        
        const queryAccess = "DELETE FROM access_token WHERE users_id=$1"
        const dataqueryAccess = [req.body.users_id];
        db.query(queryAccess, dataqueryAccess).then((results) => {
          res.status(200).send({
            message: "Logout complete."
          });
        }).catch(error => {
          res.status(500).send({
            message: error.message
          });
        });
      }else{
        res.status(500).send({
            message: "Token not match user"
        });
      }
    }
  });
  
};

register = (req, res) => {
  var time = moment();
  var dateNow = time.format('YYYY-MM-DD HH:mm:ss');
  const username = req.body.username
  const password = req.body.password
  const title = req.body.title
  const firstname = req.body.firstname
  const lastname = req.body.lastname
  const nickname = req.body.nickname
  const gender = req.body.gender
  const dob = req.body.dob
  const mobileno = req.body.mobileno
  const active = "T"
  return new Promise(function(resolve){
    const query = `INSERT INTO users(username, password, firstname, lastname, nickname, title,
                                    gender, dob, mobileno, active, create_by, create_date, update_by, update_date) 
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)  RETURNING users_id;`
    const dataquery = [username, 
                       password, 
                       firstname, 
                       lastname, 
                       nickname, 
                       title,
                       gender, 
                       dob,
                       mobileno, 
                       active,
                       req.users_id,
                       dateNow,
                       req.users_id,
                       dateNow];
    db.query(query, dataquery).then((results) => {
      const users_id = results.rows[0].users_id
      resolve(users_id)
    })
    .catch(error => {
      console.log(error)
      res.status(500).send({
        message: error.message
      });
    });
  })
}

getProfile = async (req, res) => {
  
  return new Promise(function(resolve){
    let query = `SELECT a.* 
                 FROM  users a
                 WHERE a.users_id=${req.users_id}
                `
    db.query(query, []).then((results) => {
      var dataReturn = {}
      if(results.rows.length>0){
        dataReturn["data"] = results.rows
        resolve(dataReturn)
      }else{
        resolve(false)
      }
    })
    .catch(error => {
      res.status(500).send({
        message: error.message
      });
    });
  })
}

const authentication = {
  verifyToken: verifyToken,
  signIn: signIn,
  createRefresh: createRefresh,
  getRefreshToken: getRefreshToken,
  getAccessToken: getAccessToken,
  logout: logout,
  createAccessToken: createAccessToken,
  register: register,
  checkDuplicateUsername: checkDuplicateUsername,
  getProfile: getProfile
};
module.exports = authentication;