const config = require("../config/db.config.js");
const postgres = require('pg')
const Pool = require('pg').Pool
const db = new Pool({
  user: config.USER,
  host: config.HOST,
  database: config.DB,
  password: config.PASSWORD,
  port: 5433,
})
postgres.types.setTypeParser(1114, function (value) {
  return value
})
module.exports = db;