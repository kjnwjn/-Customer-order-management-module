const { responseJson } = require("../../utils/response");
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
                bcrypt.compare(password, accountQuery.password, async (err, isValid) => {
                    if (isValid) {
                        const { password, ...payload } = accountQuery;
                        let token = jwt.sign(
                            {
                                payload,
                            },
                            process.env.SECRET_KEY,
                            {
                                expiresIn: "1h",
                            }
                        );
                        await accountModel.findOneAndUpdate({ userCode }, { access_token: token, status: true });
                        responseJson({
                            res,
                            status: true,
                            statusCode: 200,
                            msg: { en: "Login successfully!", vn: "Đăng nhập thành công." },
                            data: {
                                payload,
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
            console.log(error);
            responseJson({
                res,
                statusCode: 500,
                msg: { en: error.message },
            });
        }
    },
    logout: async (req, res, next) => {
        // #swagger.tags = ['Account']
        responseJson({
            res,
            msg: { en: "password is required" },
        });
    },
};
