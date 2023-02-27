const { responseJson } = require("../../utils/response");
const roleConfigs = require("../../configs/role");
const { generateRandomString } = require("../../utils/index");
const accountModel = require("../../models/account");
const dishModel = require("../../models/dish");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
module.exports = {
    createNewDish: async (req, res, next) => {
        let dishId = generateRandomString(6);
        let name = req.body.name ? req.body.name : null;
        let price = req.body.price ? req.body.price : null;
        let categoryId = req.body.categoryId ? req.body.price : null;
        let thumbnailUrl = req.body.thumbnailUrl ? req.body.thumbnailUrl : null;
    },
};
