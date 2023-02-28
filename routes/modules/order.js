const { responseJson } = require("../../utils/response");
const roleConfigs = require("../../configs/role");
const { generateRandomString } = require("../../utils/index");
const orderModel = require("../../models/order");
const accountModel = require("../../models/account");
const tableModel = require("../../models/table");
const socket = require("../../bin/www");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
module.exports = {
    newOrder: async (req, res, next) => {
        // #swagger.tags = ['Order']
        try {
            let orderId = generateRandomString(6);
            let userCode = req.body.userCode ? req.body.userCode.toUpperCase() : null;
            let tableId = req.body.tableId || null;

            do {
                orderId = generateRandomString(6);
            } while (await orderModel.findOne({ orderId }));
            if (!userCode) {
                return responseJson({
                    res,
                    msg: {
                        en: "userCode is require.",
                        vn: "Mã nhân viên là bắt buộc.",
                    },
                });
            }
            if (!tableId) {
                return responseJson({
                    res,
                    msg: {
                        en: "tableId is require.",
                        vn: "Số bàn là bắt buộc.",
                    },
                });
            }
            const checkUserCode = await accountModel.findOne({ userCode });
            console.log(checkUserCode && checkUserCode.status);
            if (!(checkUserCode && checkUserCode.status)) {
                return responseJson({
                    res,
                    msg: {
                        en: `User "${userCode}" does not exit or user is not active.`,
                        vn: `Nhân viên "${userCode}" không tồn tai hoặc chưa đăng nhập vào hệ thống.`,
                    },
                });
            }

            const checkTable = await tableModel.findOne({ tableId });
            if (!(checkTable && !checkTable.status)) {
                return responseJson({
                    res,
                    msg: {
                        en: `Table "${tableId}" does not exit! or is using!`,
                        vn: `Bàn số "${tableId}" không tồn tại hoặc  đang được sử dụng .`,
                    },
                });
            }

            const openTable = await tableModel.findOneAndUpdate({ tableId }, { status: true });
            if (openTable) {
                socket.io.emit("update-table-status", { id: tableId, status: true });
                const newOrder = new orderModel({ orderId, userCode, tableId });
                await newOrder.save();
                return responseJson({
                    res,
                    status: true,
                    msg: {
                        en: `Create new order for table "${tableId}" successfully!`,
                        vn: `Đã tạo mới 1 hoá đơn cho bàn số "${tableId}" thành công .`,
                    },
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
    removeOrder: async (req, res, next) => {
        // #swagger.tags = ['Order']
        try {
            let orderId = req.query.orderId || null;
            const queryOrder = await orderModel.findOne({ orderId });
            if (!queryOrder) {
                return responseJson({
                    res,
                    msg: {
                        en: "orderId does not exit.",
                        vn: "orderId không tồn tai.",
                    },
                });
            }
            if (queryOrder.status !== "INITIAL") {
                return responseJson({
                    res,
                    msg: {
                        en: `order ${queryOrder.orderId} can not be modified`,
                        vn: `order ${queryOrder.orderId} không thể chỉnh sửa`,
                    },
                });
            }
            const updateTable = await tableModel.findOneAndUpdate({ tableId: queryOrder.tableId }, { status: false });
            if (updateTable) {
                orderModel.remove({ orderId: queryOrder.orderId }, (e) => {
                    if (e) {
                        return responseJson({
                            res,
                            statusCode: 500,
                            msg: {
                                en: error.message,
                            },
                        });
                    } else {
                        socket.io.emit("update-table-status", { tableId: queryOrder.tableId, status: false });
                        return responseJson({
                            res,
                            msg: {
                                en: `order ${queryOrder.orderId} has been removed`,
                                vn: `order ${queryOrder.orderId} đã được xoá`,
                            },
                        });
                    }
                });
            } else {
                return responseJson({
                    res,
                    statusCode: 500,
                    msg: {
                        en: error.message,
                    },
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
};
