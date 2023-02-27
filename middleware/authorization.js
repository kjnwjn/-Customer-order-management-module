const jwt = require("jsonwebtoken");
const role = require("../configs/role");
const { isTokenExpired } = require("../utils/index");
const { responseJson } = require("../utils/response");
const refreshToken = require("./refreshToken");
const authorization = {
    admin: async (req, res, next) => {
        try {
            const token = req.query.token || req.headers["x-access-token"] || req.cookies.token || null;

            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY, async (error, payload) => {
                if (error) {
                    if (isTokenExpired(token)) {
                        refreshToken(req, res);
                        return next();
                    }
                }

                if (payload && payload.role.toUpperCase() == role.admin) {
                    return next();
                } else {
                    return responseJson({
                        res,
                        statusCode: 401,
                        msg: {
                            en: "Permission denied! Only admin is allowed to access this enpoint!",
                            vn: "Bạn không có quyền truy cập. Vui lòng liên hệ quản trị viên!",
                        },
                    });
                }
            });
        } catch (error) {
            return responseJson({
                res,
                statusCode: 500,
                msg: {
                    en: "Interal Server Error",
                },
                data: {
                    error: error.message,
                },
            });
        }
    },
    manager: async (req, res, next) => {
        try {
            const token = req.query.token || req.headers["x-access-token"] || null;
            jwt.verify(token, process.env.SECRET_KEY, async (error, payload) => {
                if (payload.data.role.toUpperCase() == role.admin || payload.data.role.toUpperCase() == role.manager) {
                    return next();
                } else {
                    return res.status(401).json({
                        status: false,
                        msg: {
                            en: "Permission denied! Only admin is allowed to access this enpoint!",
                            vn: "Bạn không có quyền truy cập. Vui lòng liên hệ quản trị viên!",
                        },
                    });
                }
            });
        } catch (error) {
            return res.status(500).json({
                status: false,
                statusCode: 500,
                msg: { en: "Interal Server Error" },
                error: error.message,
            });
        }
    },
};

module.exports = authorization;
