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

    getAllTable: async (req, res, next) => {
        // #swagger.tags = ['Table']
        try {
            let tables = await tableModel.find({});
            if (tables.length < 0) {
                return responseJson({
                    res,
                    msg: { en: "List tables is empty!", vn: "Danh sách bàn rỗng!" },
                });
            }
            let listTables = tables.map((table) => {
                return {
                    tableId: table.tableId,
                    status: table.status,
                };
            });
            return responseJson({
                res,
                status: true,
                msg: { en: "Get list tables successfully!", vn: "Lấy danh sách bàn thành công!" },
                data: {
                    listTables,
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
