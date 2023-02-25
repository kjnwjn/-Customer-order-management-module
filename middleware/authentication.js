const jwt = require("jsonwebtoken");
const { responseJson } = require("../utils/response");
const accountModel = require("../models/account");

const authentication = async function (req, res, next) {
    try {
        const token = req.query.token || req.headers["x-access-token"] || req.cookies.token;
        const refreshToken = req.cookies.refreshToken;

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY, async (error, payload) => {
            // console.log(payload);
            if (!payload) {
                jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET_KEY, async (e, refreshPayload) => {
                    if (e) {
                        responseJson({
                            res,
                            statusCode: 401,
                            msg: {
                                en: "token is invalid or has been expired, please login again.",
                                vn: "token không hợp lệ hoặc đã hết hạn, vui lòng đăng nhập lại.",
                            },
                        });
                    } else {
                        !refreshPayload
                            ? responseJson({
                                  res,
                                  statusCode: 401,
                                  msg: {
                                      en: "token is invalid or has been expired, please login again.",
                                      vn: "token không hợp lệ hoặc đã hết hạn, vui lòng đăng nhập lại.",
                                  },
                              })
                            : undefined;
                        // console.log(refreshPayload);
                        const accountQuery = await accountModel.findOne({ userCode: refreshPayload.userCode });

                        if (refreshToken == accountQuery.refresh_token) {
                            let newToken = jwt.sign(
                                {
                                    userCode: accountQuery.userCode,
                                    fullName: accountQuery.fullName,
                                    role: accountQuery.role,
                                    status: accountQuery.status,
                                },
                                process.env.ACCESS_TOKEN_SECRET_KEY,
                                {
                                    expiresIn: "1m",
                                }
                            );
                            res.cookie("token", newToken);
                            await accountModel.findOneAndUpdate({ userCode: refreshPayload.userCode }, { access_token: newToken });
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
                    }
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
