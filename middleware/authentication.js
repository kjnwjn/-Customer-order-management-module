const jwt = require("jsonwebtoken");
const { isTokenExpired } = require("../utils/index");
const { responseJson } = require("../utils/response");
const refreshToken = require("./refreshToken");
const authentication = async function (req, res, next) {
    try {
        const token = req.query.token || req.headers["x-access-token"] || req.cookies.token;

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY, async (error, payload) => {
            // console.log(payload);
            if (error) {
                if (isTokenExpired(token)) {
                    refreshToken(req, res);
                    return next();
                } else {
                    return responseJson({
                        res,
                        statusCode: 401,
                        msg: {
                            en: "token is invalid, please login again.",
                            vn: "token không hợp lệ, vui lòng đăng nhập lại.",
                        },
                    });
                }
            }
            if (!payload) {
                return responseJson({
                    res,
                    statusCode: 401,
                    msg: {
                        en: "Refresh token is invalid or has been expired, please login again.",
                        vn: "Refresh token không hợp lệ hoặc đã hết hạn, vui lòng đăng nhập lại.",
                    },
                });
            } else {
                return next();
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
