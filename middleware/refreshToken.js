const jwt = require("jsonwebtoken");
const { responseJson } = require("../utils/response");
const accountModel = require("../models/account");
const { isTokenExpired } = require("../utils/index");
module.exports = async function (req, res) {
    const refreshToken = req.cookies.refreshToken || null;
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET_KEY, async (e, refreshPayload) => {
        if (e) {
            if (isTokenExpired(refreshToken)) {
                return responseJson({
                    res,
                    statusCode: 401,
                    msg: {
                        en: "Refresh token has been expired, please login again.",
                        vn: "Refresh_token đã hết hạn, vui lòng đăng nhập lại.",
                    },
                });
            } else {
                return responseJson({
                    res,
                    statusCode: 401,
                    msg: {
                        en: "Refresh token is invalid, please login again.",
                        vn: "Refresh token không hợp lệ, vui lòng đăng nhập lại.",
                    },
                });
            }
        } else {
            if (!refreshPayload) {
                return responseJson({
                    res,
                    statusCode: 401,
                    msg: {
                        en: "Refresh token 1 is invalid or has been expired, please login again.",
                        vn: "Refresh token 1 không hợp lệ hoặc đã hết hạn, vui lòng đăng nhập lại.",
                    },
                });
            }

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
            }
        }
    });
};
