const { responseJson } = require("../../utils/response");
const accountModel = require("../../models/account");
const bcrypt = require("bcrypt");
module.exports = {
    login: async (req, res, next) => {
        // #swagger.tags = ['Account']
        // #swagger.description = 'This endpoint provides method for logging in system. Then receive an access token.'
        let userCode = req.body.userCode ? req.body.userCode.toUpperCase() : "";
        let password = req.body.password || null;
        !userCode
            ? responseJson({
                  res,
                  message: "userCode is required",
              })
            : undefined;
        !password
            ? responseJson({
                  res,
                  message: "password is required",
              })
            : undefined;
        accountModel.findOne({ userCode }, (err, result) => {
            if (!err && result) {
                bcrypt.compare(password, result.password, (err, isValid) => {
                    if (!err && isValid) {
                        const { password, ...payload } = result;
                        let token = jwt.sign(
                            {
                                payload,
                            },
                            process.env.JWT_SECRET,
                            {
                                expiresIn: "1h",
                            }
                        );
                    }
                });
            }
        });
    },
    logout: async (req, res, next) => {
        // #swagger.tags = ['Account']
    },
};
