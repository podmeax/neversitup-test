const db = require("./dbconnection");

exports.productList = async (req, res) => {
  
  return new Promise(function(resolve){
    let canQuery = true
    let query = `SELECT a.product_id, a.name, a.detail, a.price, count(a.*) OVER() AS total_row,
                        CONCAT(b.title, ' ', b.firstname, ' ', b.lastname) as create_by, a.update_date, a.create_date,
                        CONCAT(c.title, ' ', c.firstname, ' ', c.lastname) as update_by
                  FROM  product a
                  INNER JOIN users b on b.users_id=a.create_by
                  INNER JOIN users c on c.users_id=a.update_by
                  `

    if(req.query.product_name){
        query = query + ` WHERE a.name like '%${req.query.product_name}%'`
    }
    if((req.query.limit && req.query.offset)){
      query = query + " LIMIT $1 OFFSET $2"
      dataquery.push(req.query.limit)
      dataquery.push(req.query.offset)
    }else if((req.query.limit && !req.query.offset) || (!req.query.limit && req.query.offset)){
      canQuery = false
      res.status(500).send({
        message: "Limit and Offset must be provide together!"
      });
    }
    query = query + " ORDER BY a.create_date desc"
    if(canQuery){
      db.query(query, []).then((results) => {
        var dataReturn = {}
        if(results.rows.length>0){
            dataReturn["total_row"] = results.rows[0].total_row- -0
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
    }else{
      res.status(500).send({
        message: "Internal Error"
      });
    }
  })
  
  
}