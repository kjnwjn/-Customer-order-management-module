const { responseJson } = require("../../utils/response");
const roleConfigs = require("../../configs/role");
const { generateRandomString } = require("../../utils/index");
const accountModel = require("../../models/account");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
module.exports = {
    login: async (req, res, next) => {
        // #swagger.tags = ['Account']
        // #swagger.description = 'This endpoint provides method for logging in system. Then receive an access token.'
        try {
            let userCode = req.body.userCode ? req.body.userCode.toUpperCase() : "";
            let password = req.body.password || null;
            if (!userCode) {
                return responseJson({
                    res,
                    msg: { en: "userCode is required" },
                });
            }
            if (!password) {
                return responseJson({
                    res,
                    msg: { en: "password is required" },
                });
            }
            let accountQuery = await accountModel.findOne({ userCode });
            if (accountQuery) {
                // console.log(accountQuery);
                bcrypt.compare(password, accountQuery.password, async (err, isValid) => {
                    if (isValid) {
                        let token = jwt.sign(
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
                        let refreshToken = jwt.sign(
                            {
                                userCode: accountQuery.userCode,
                                fullName: accountQuery.fullName,
                                role: accountQuery.role,
                                status: accountQuery.status,
                            },
                            process.env.REFRESH_TOKEN_SECRET_KEY,
                            {
                                expiresIn: "30 days",
                            }
                        );
                        res.cookie("refreshToken", refreshToken);
                        res.cookie("token", token);
                        await accountModel.findOneAndUpdate({ userCode }, { access_token: token, refresh_token: refreshToken, status: true });
                        return responseJson({
                            res,
                            status: true,
                            statusCode: 200,
                            msg: { en: "Login successfully!", vn: "Đăng nhập thành công." },
                            data: {
                                token,
                                refreshToken,
                            },
                        });
                    } else {
                        return responseJson({
                            res,
                            statusCode: 401,
                            msg: { en: "Invalid password!", vn: "Mật khẩu không hợp lệ." },
                        });
                    }
                });
            } else {
                return responseJson({
                    res,
                    msg: { en: "Account does not exist!", vn: "Tài khoản không tồn tại." },
                });
            }
        } catch (error) {
            return responseJson({
                res,
                statusCode: 500,
                msg: { en: error.message },
            });
        }
    },
    logout: async (req, res, next) => {
        // #swagger.tags = ['Account']
        // #swagger.description = 'This endpoint provides method for logout in system. Then receive an access token.'
        try {
            const token = req.headers["x-access-token"] || req.query.token || req.cookies.token || null;
            req.cookies.token ? res.clearCookie("token") : undefined;
            req.cookies.refreshToken ? res.clearCookie("refreshToken") : undefined;
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY, async (error, payload) => {
                await accountModel.findOneAndUpdate({ userCode: payload.userCode }, { access_token: "#N/A", refresh_token: "#N/A", status: false });
                return responseJson({
                    res,
                    status: true,
                    msg: {
                        en: "Logout successfully",
                        vn: "Đăng xuất thành công",
                    },
                });
            });
        } catch (e) {
            return responseJson({
                res,
                statusCode: 500,
                msg: { en: error.message },
            });
        }
    },
    newAccount: async (req, res, next) => {
        // #swagger.tags = ['Account']
        let userCode = generateRandomString(6);
        let password = generateRandomString(6);
        let fullName = req.body.fullName ? req.body.fullName.toUpperCase() : null;
        let role = req.body.role ? req.body.role.toUpperCase() : null;
        do {
            userCode = generateRandomString(6);
        } while (await accountModel.findOne({ userCode }));

        if (!fullName) {
            return responseJson({
                res,
                msg: {
                    en: "fullName is require.",
                    vn: "Họ và tên nhân viên là bắt buộc.",
                },
            });
        }
        const correctRoles = Object.values(roleConfigs);
        if (!role) {
            return responseJson({
                res,
                msg: {
                    en: "role is require.",
                    vn: "Chức vụ nhân viên là bắt buộc.",
                },
            });
        }
        const checkRole = correctRoles.filter((correctRole) => {
            return correctRole == role;
        });
        if (checkRole.length > 0) {
            const hashPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
            const newAccount = new accountModel({ userCode, password: hashPassword, fullName, role });
            await newAccount.save();
            return responseJson({
                res,
                status: true,
                msg: {
                    en: `Create an account for user "${fullName}" successfully!`,
                    vn: `Đã tạo tài khoản nhân viên thành công cho "${fullName}".`,
                },
            });
        } else {
            return responseJson({
                res,
                msg: {
                    en: `Role invalid!`,
                    vn: `Chức vụ nhân viên không hợp lệ!".`,
                },
            });
        }
    },
    getAllAccount: async (req, res, next) => {
        // #swagger.tags = ['Account']
        try {
            let users = await accountModel.find({});
            if (users.length < 0) {
                return responseJson({
                    res,
                    msg: { en: "List user is empty!", vn: "Danh sách tài khoản rỗng!" },
                });
            }
            let listUsers = users.map((user) => {
                return {
                    userCode: user.userCode,
                    fullName: user.fullName,
                    status: user.status,
                    role: user.role,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                };
            });
            return responseJson({
                res,
                status: true,
                msg: { en: "Get list user successfully!", vn: "Lấy danh sách tài khoản thành công!" },
                data: {
                    listUsers,
                },
            });
        } catch (error) {
            return responseJson({
                res,
                statusCode: 500,
                msg: { en: error.message },
            });
        }
    },
    refreshToken: async function (req, res, next) {
        // #swagger.tags = ['Account']
        const refreshToken = req.cookies.refreshToken || null;
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET_KEY, async (e, refreshPayload) => {
            if (e) {
                return responseJson({
                    res,
                    statusCode: 401,
                    msg: {
                        en: "Refresh token is invalid, please login again.",
                        vn: "Refresh token không hợp lệ, vui lòng đăng nhập lại.",
                    },
                });
            } else {
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
                            expiresIn: "1h",
                        }
                    );
                    await accountModel.findOneAndUpdate({ userCode: refreshPayload.userCode }, { access_token: newToken });
                    res.cookie("token", newToken);
                    return responseJson({
                        res,
                        status: 200,
                        msg: {
                            en: "token updated successfully",
                            vn: "token đã được thay đổi thành công",
                        },
                        data: {
                            token: newToken,
                        },
                    });
                }
            }
        });
    },
};
