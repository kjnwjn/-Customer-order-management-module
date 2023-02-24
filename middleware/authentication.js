const jwt = require("jsonwebtoken");
const { responseJson } = require("../utils/response");
const accountModel = require("../models/account");

const authentication = async function (req, res, next) {
    try {
        const token = req.query.token || req.headers["x-access-token"] || req.cookies.token;
        const refreshToken = req.query.refreshToken || req.headers["x-access-refreshToken"] || req.cookies.refreshToken;
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY, async (error, payload) => {
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
                const accountQuery = await accountModel.findOne({ userCode: payload.userCode });
                if (token == accountQuery.access_token) {
                    return next();
                } else {
                    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET_KEY, async (e, refreshPayload) => {
                        if (!e && refreshToken == accountQuery.refresh_token) {
                            let newToken = jwt.sign(
                                {
                                    userCode: accountQuery.userCode,
                                    fullName: accountQuery.fullName,
                                    role: accountQuery.role,
                                    status: accountQuery.status,
                                },
                                process.env.ACCESS_TOKEN_SECRET_KEY,
                                {
                                    expiresIn: "1h",
                                }
                            );
                            await accountModel.findOneAndUpdate({ userCode: payload.userCode }, { access_token: newToken });
                            return next();
                        } else {
                            responseJson({
                                res,
                                statusCode: 401,
                                msg: {
                                    en: "Refresh token is invalid or has been expired, please login again.",
                                    vn: "Refresh_token không hợp lệ hoặc đã hết hạn, vui lòng đăng nhập lại.",
                                },
                            });
                        }
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
