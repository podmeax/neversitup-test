const models = require("../models/order.models");

exports.orderList = async (req, res) => {
    var returnList = await models.orderList(req, res)
    if (returnList==false) {
        res.status(404).send({ message: "Product list not found." });
    }else{
        let order_list = {}
        returnList["data"].forEach((element) => {
            var dataToPush = {}
            var order_code = ""
            for (const [key, value] of Object.entries(element)) {
                if(key=='product_name' || key=='product_id' || key=='qty' || key=='total_price'){
                    dataToPush[key] = value
                }
                if(key=='order_code') order_code = value
            }
            if(order_list[order_code]===undefined) order_list[order_code] = []
            order_list[order_code].push(dataToPush)
        })
        res.status(200).json({
            message: "Success",
            total_row: returnList["total_row"],
            order_list: order_list
        });
    }
};

exports.addOrder = async (req, res) => {
    if(req.body.product_list==0){
        res.status(200).send({message: "Product cannot be Null." });
    }else{
        var returnList = await models.addOrder(req, res)
        if (returnList==false) {
            res.status(500).send({message: "Internal error." });
        }else{
            res.status(200).send({
                message: "Success"
            });
        }

    }   
  
};

exports.cancelOrder = async (req, res) => {
    if(!req.params.order_code){
        res.status(200).send({message: "Order code cannot be Null." });
    }else{
        var returnList = await models.cancelOrder(req, res)
        if (returnList==false) {
            res.status(500).send({message: "Internal error." });
        }else{
            res.status(200).send({
                message: "Success"
            });
        }

    }   
  
};