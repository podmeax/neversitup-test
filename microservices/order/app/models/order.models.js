const db = require("./dbconnection");
var moment = require('moment');
var format = require('pg-format');

exports.orderList = async (req, res) => {
  
  return new Promise(function(resolve){
    let canQuery = true
    let query = `SELECT a.order_id, a.order_code, a.product_id, a.product_name, a.qty, a.total_price,
                        CONCAT(b.title, ' ', b.firstname, ' ', b.lastname) as create_by, a.update_date, a.create_date,
                        CONCAT(c.title, ' ', c.firstname, ' ', c.lastname) as update_by
                  FROM  orders a
                  INNER JOIN users b on b.users_id=a.create_by
                  INNER JOIN users c on c.users_id=a.update_by
                  WHERE a.status is null OR a.status!='cancel'
                  `

    if(req.query.order_code){
        query = query + ` AND a.order_code like '%${req.query.order_code}%'`
    }
    if(req.query.users_id){
        query = query + ` AND a.create_by=${req.query.users_id}`
    }
    query = query + " ORDER BY a.create_date desc"

    if(canQuery){
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
    }else{
      res.status(500).send({
        message: "Internal Error"
      });
    }
  })
  
  
}

exports.addOrder = (req, res) => {
    var time = moment();
    var dateNow = time.format('YYYY-MM-DD HH:mm:ss');

    return new Promise(function(resolve){
        let insertValue = []
        let order_code = req.users_id + "-" + time
        for (var i = 0; i < req.body.product_list.length; i++) {
        insertValue.push([order_code, 
                            req.body.product_list[i]['product_id'], 
                            req.body.product_list[i]['product_name'],
                            req.body.product_list[i]['qty'],
                            req.body.product_list[i]['total_price'],
                            req.users_id, 
                            dateNow, 
                            req.users_id, 
                            dateNow])
        }
        let queryOrder = format("INSERT INTO orders(order_code, product_id, product_name, qty, total_price, create_by, create_date, update_by, update_date) VALUES %L", insertValue);
        db.query(queryOrder).then(() => {
        resolve(true)
        })
        .catch(error => {
            console.log(error.message)
        res.status(500).send({
            message: error.message
        });
        });
    })
}

exports.cancelOrder = (req, res) =>{
    return new Promise(async (resolve) => {
        try {
            await db.query(
                "UPDATE orders SET status='cancel' WHERE order_code=$1",
                [req.params.order_code]
            );
            return resolve(true);
        } catch (error) {
            return res.status(500).send({
                message: error.message,
            });
        }
    });
}
