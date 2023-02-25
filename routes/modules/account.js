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
            !userCode
                ? responseJson({
                      res,
                      msg: { en: "userCode is required" },
                  })
                : undefined;
            !password
                ? responseJson({
                      res,
                      msg: { en: "password is required" },
                  })
                : undefined;
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
                        responseJson({
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
                        responseJson({
                            res,
                            statusCode: 401,
                            msg: { en: "Invalid password!", vn: "Mật khẩu không hợp lệ." },
                        });
                    }
                });
            } else {
                responseJson({
                    res,
                    msg: { en: "Account does not exist!", vn: "Tài khoản không tồn tại." },
                });
            }
        } catch (error) {
            responseJson({
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
            responseJson({
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
            responseJson({
                res,
                msg: {
                    en: "fullName is require.",
                    vn: "Họ và tên nhân viên là bắt buộc.",
                },
            });
        }
        console.log(roleConfigs);
        const correctRoles = Object.values(roleConfigs);
        console.log(correctRoles);
        if (!role) {
            responseJson({
                res,
                msg: {
                    en: "role is require.",
                    vn: "Chức vụ nhân viên là bắt buộc.",
                },
            });
        }
        const a = correctRoles.filter((correctRole) => {
            return correctRole == role;
        });
        console.log(a);
        res.end();
        // const hashPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
        // const newAccount = new accountModel({ userCode, password: hashPassword, fullName, role });
        // await newAccount.save();
        // responseJson({
        //     res,
        //     status: true,
        //     msg: {
        //         en: `Create an account for user "${fullName}" successfully!`,
        //         vn: `Đã tạo tài khoản nhân viên thành công cho "${fullName}".`,
        //     },
        // });
    },
    getAllUsers: async (req, res, next) => {
        // #swagger.tags = ['Account']
        // #swagger.description = 'This endpoint provides method for logout in system. Then receive an access token.'
        try {
            let users = await accountModel.find({});
            users
                ? responseJson({
                      res,
                      status: true,
                      msg: { en: "Get list user successfully!", vn: "Lấy danh sách tài khoản thành công!" },
                      data: {
                          users,
                      },
                  })
                : responseJson({
                      res,
                      msg: { en: "List user is empty!", vn: "Danh sách tài khoản rỗng!" },
                  });
        } catch (error) {
            responseJson({
                res,
                statusCode: 500,
                msg: { en: error.message },
            });
        }
    },
};
