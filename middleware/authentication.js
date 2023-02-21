const jwt = require("jsonwebtoken");
const accountModel = require("../models/account");
const { responseJson } = require("../utils/response");

const authentication = async function (req, res, next) {
    const token = req.query.token || req.headers["x-access-token"];
    jwt.verify(token, process.env.SECRET_KEY, async (error, payload) => {
        if (error) {
            responseJson({
                res,
                statusCode: 401,
                msg: "Invalid token!",
            });
        } else {
            console.log("\x1b[31m%s\x1b[0m", 123);

            // const account = await accountModel.findOne({_id:payload.id})
            // req.account = account
            // next()
        }
    });
};

module.exports = authentication;
