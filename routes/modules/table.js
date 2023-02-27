const { responseJson } = require("../../utils/response");
const roleConfigs = require("../../configs/role");
const { generateRandomString } = require("../../utils/index");
const orderModel = require("../../models/order");
const accountModel = require("../../models/account");
const tableModel = require("../../models/table");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
module.exports = {
    newTable: async (req, res, next) => {
        // #swagger.tags = ['Table']
        try {
            const newTable = new tableModel({});
            await newTable.save();
            return responseJson({
                res,
                status: true,
                msg: {
                    en: `Create new table successfully!`,
                    vn: `Đã tạo mới 1 bàn thành công .`,
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
};
