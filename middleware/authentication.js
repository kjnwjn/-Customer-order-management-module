const jwt = require("jsonwebtoken");
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
            next()
        }
    });
};

module.exports = authentication;
