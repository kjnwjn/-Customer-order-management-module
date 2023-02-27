const { responseJson } = require("../../utils/response");
const roleConfigs = require("../../configs/role");
const { generateRandomString } = require("../../utils/index");
const orderModel = require("../../models/order");
const accountModel = require("../../models/account");
const tableModel = require("../../models/table");
const dishModel = require("../../models/dish");

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
    addToCart: async (req, res, next) => {
        const orderId = req.params.orderId || req.body.orderId || req.body.orderId || null;
        const tableId = req.params.tableId || req.query.tableId || req.body.tableId || null;
        const dishId = req.params.dishId || req.query.dishId || req.body.dishId || null;
        const quantity = req.params.quantity || req.query.quantity || req.body.quantity || 1;
        const dishQuery = await dishModel.findOne({ dishId });
        const tableQuery = await tableModel.findOne({ tableId });
        const orderQuery = await orderModel.findOne({ orderId });
        if (!orderQuery) {
            return responseJson({
                res,
                statusCode: 404,
                msg: {
                    en: `Order "${orderId}" is invalid.`,
                    vn: `OrderId không hợp lệ.`,
                },
            });
        }
        if (!tableQuery) {
            return responseJson({
                res,
                statusCode: 404,
                msg: {
                    en: `Table "${tableId}" does not exit! or is using!`,
                    vn: `Bàn số "${tableId}" không tồn tại hoặc  đang được sử dụ`,
                },
            });
        }
        if (!tableQuery.status) {
            return responseJson({
                res,
                msg: {
                    en: `Table "${tableId}" was not initialized.`,
                    vn: `Thất bại.`,
                },
            });
        }
        if (!dishQuery) {
            return responseJson({
                res,
                statusCode: 404,
                msg: {
                    en: `Dish "${dishId}" does not exit! or is using!`,
                    vn: `Đơn vị "${dishId}" không tồn tại hoặc  đang được`,
                },
            });
        }
        if (!dishQuery.status) {
            return responseJson({
                res,
                msg: {
                    en: `Dish "${dishId}" is not available.`,
                    vn: `Không có sẵn.`,
                },
            });
        }

        // Add new dish queried to orderData of orderModel and check if dishId is existing then add old quantity with new quantity
        const orderData = orderQuery.orderData || [];
        const dishIndex = orderData.findIndex((item) => item.dishId === dishId);
        if (dishIndex >= 0) {
            const dish = orderData[dishIndex];
            dish.quantity += quantity;
            orderData[dishIndex] = dish;
        } else {
            orderData.push({
                dishId,
                quantity,
            });
        }
        orderQuery.orderData = orderData;
        await orderQuery.save();
        return responseJson({
            res,
            statusCode: 200,
            msg: {
                en: `Added ${quantity} ${dishQuery.name} to cart.`,
                vn: `Đã thêm ${quantity} ${dishQuery.name} vào giỏ hàng.`,
            },
        });
    },
};
