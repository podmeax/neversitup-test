const models = require("../models/product.models");

exports.productList = async (req, res) => {
    var returnList = await models.productList(req, res)
    if (returnList==false) {
        res.status(404).send({ message: "Product list not found." });
    }else{
        res.status(200).json({
            message: "Success",
            total_row: returnList["total_row"],
            product_list: returnList["data"]
        });
    }
};