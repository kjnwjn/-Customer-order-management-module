const jwt = require("jsonwebtoken");
const { responseJson } = require("../utils/response");
const accountModel = require("../models/account");

const authentication = async function (req, res, next) {
    try {
        const token = req.query.token || req.headers["x-access-token"];
        jwt.verify(token, process.env.SECRET_KEY, async (error, payload) => {
            if (error) {
                responseJson({
                    res,
                    statusCode: 401,
                    msg: {
                        en: "Access token is invalid or has been expired, please login again.",
                        vn: "Access_token không hợp lệ hoặc đã hết hạn, vui lòng đăng nhập lại.",
                    },
                });
            } else {
                const accountQuery = await accountModel.findOne({ userCode: payload.data.userCode });
                if (token == accountQuery.access_token) {
                    return next();
                } else {
                    responseJson({
                        res,
                        statusCode: 401,
                        msg: {
                            en: "Access token is invalid or has been expired, please login again.",
                            vn: "Access_token không hợp lệ hoặc đã hết hạn, vui lòng đăng nhập lại.",
                        },
                    });
                }
            }
        });
    } catch (e) {
        return responseJson({
            res,
            statusCode: 500,
            msg: { en: "Interal Server Error" },
            error: error.message,
        });
    }
};

module.exports = authentication;
