const { responseJson } = require("../../utils/response");
const roleConfigs = require("../../configs/role");
const { generateRandomString } = require("../../utils/index");
const orderModel = require("../../models/order");
const accountModel = require("../../models/account");
const dishModel = require("../../models/dish");
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
            if (!(checkUserCode && checkUserCode.status)) {
                return responseJson({
                    res,
                    msg: {
                        en: `User "${userCode}" does not exist or user is not active.`,
                        vn: `Nhân viên "${userCode}" không tồn tai hoặc chưa đăng nhập vào hệ thống.`,
                    },
                });
            }

            const checkTable = await tableModel.findOne({ tableId });
            if (!(checkTable && !checkTable.status)) {
                return responseJson({
                    res,
                    msg: {
                        en: `Table "${tableId}" does not exist! or is using!`,
                        vn: `Bàn số "${tableId}" không tồn tại hoặc  đang được sử dụng .`,
                    },
                });
            }

            const openTable = await tableModel.findOneAndUpdate({ tableId }, { status: true });
            if (openTable) {
                socket.io.emit("update-table-status", {
                    tableId,
                    status: true,
                });
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
                        en: "orderId does not exist.",
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
    updateOrder: async (req, res, next) => {
        // #swagger.tags = ['Order']
        try {
            let orderId = req.body.orderId || null;
            let queryOrder = await orderModel.findOne({ orderId });
            if (queryOrder) {
                return responseJson({
                    res,
                    msg: {
                        en: `order ${orderId} does not exist.`,
                        vn: `hoá đơn ${orderId} không tòn tại.`,
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
        // #swagger.tags = ['Order']

        /**
         * swagger.description = 'example params : {
         "orderId": "809842",
        "messages": "any",
        "orderData": [{"dishId":123213,"qty": 2},{"dishId":809910,"qty": 2}]
        }' 
        */

        const orderId = req.body.orderId ? req.body.orderId : null;
        const orderData = req.body.orderData ? req.body.orderData : [];
        const orderQuery = await orderModel.findOne({ orderId });
        const dishAll = await dishModel.find({});

        let dishAvailable = [];
        let dishUnavailable = [];
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
        if (dishAll.length <= 0) {
            return responseJson({
                res,
                statusCode: 404,
                msg: {
                    en: `Does not exist any dish`,
                    vn: `Không tồn tại món ăn nào`,
                },
            });
        }
        if (orderData.length < 0) {
            return responseJson({
                res,
                statusCode: 404,
                msg: {
                    en: `Empty order`,
                    vn: `Không tồn tại món ăn mới nào`,
                },
            });
        }
        orderData.forEach((orderItem) => {
            const orderItemKeys = Object.keys(orderItem);
            const orderItemKeysCheck = ["dishId", "qty", "note"];
            if (orderItemKeys.length != 3) {
                return responseJson({
                    res,
                    statusCode: 200,
                    msg: {
                        en: `ALL fields are required`,
                        vn: `Thiếu trường dữ liệu`,
                    },
                });
            }
            orderItemKeys.forEach((key) => {
                if (!orderItemKeysCheck.includes(key)) {
                    return responseJson({
                        res,
                        statusCode: 200,
                        msg: {
                            en: `ALL fields are required`,
                            vn: `Thiếu trường dữ liệu`,
                        },
                    });
                }
            });
            dishAll.forEach((dish) => {
                if (dish.dishId == Number(orderItem["dishId"]) && dish.status) {
                    dishAvailable.push(orderItem);
                } else if (dish.dishId == Number(orderItem["dishId"]) && !dish.status) {
                    dishUnavailable.push(orderItem);
                }
            });
        });
        if (dishAvailable.length + dishUnavailable.length < orderData.length) {
            return responseJson({
                res,
                statusCode: 200,
                msg: {
                    en: `Exiting some field unexpected`,
                    vn: `Tồn tại một số trường không mong muốn`,
                },
            });
        }

        // res.end();

        if (dishUnavailable.length > 0) {
            return responseJson({
                res,
                statusCode: 200,
                msg: {
                    en: `some dishes are out`,
                    vn: `Một số mặt hàng,món ăn đã ngừng bán tại thời điểm này`,
                },
                data: {
                    dishUnavailable,
                },
            });
            // console.log("thông báo món hết là:", dishUnavailable);
            // Thông báo cho khách hàng món hét
        }
        // res.end();
        if (dishAvailable.length > 0) {
            const orderStorage = orderQuery.orderData || [];
            dishAvailable.forEach((dishAval) => {
                const dishIndex = orderStorage.findIndex((item) => item.dishId === dishAval.dishId);
                if (dishIndex >= 0) {
                    const dish = orderStorage[dishIndex];
                    dish.qty += dishAval.qty;
                    orderStorage[dishIndex] = dish;
                } else {
                    orderStorage.push({
                        dishId: dishAval.dishId,
                        qty: dishAval.qty,
                        note: dishAval.note || "",
                    });
                }
            });

            orderQuery.orderData = orderStorage;
            await orderQuery.save();
            socket.io.emit("update-order-data", {
                orderId,
                dishes: dishAvailable,
            });
            return responseJson({
                res,
                statusCode: 200,
                msg: {
                    en: `Order updated successfully`,
                    vn: `Đơn hàng của bạn đang được chuẩn bị`,
                },
                data: {
                    dishAvailable,
                },
            });
        } else {
            return responseJson({
                res,
                statusCode: 200,
                msg: {
                    en: `Empty order`,
                    vn: `Vui lòng thêm món vào giỏ hàng`,
                },
            });
        }
    },
    payOrder: async (req, res, next) => {
        let [change, totalPrice] = 0;
        const orderId = req.body.orderId || req.body.orderId || null;
        const tableId = req.query.tableId || req.body.tableId || null;
        const money = req.query.money || req.body.money || 0;
        const orderQuery = await orderModel.findOne({ orderId });
        const tableQuery = await tableModel.findOne({ tableId });
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
                    en: `Table "${tableId}" does not exit or is using!`,
                    vn: `Bàn số "${tableId}" không tồn tại hoặc  đang được sử dụng`,
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

        // Calculate the total price from the price of each items in orderData and multiply with the quantity
        const orderData = orderQuery.orderData || [];
        for (let i = 0; i < orderData.length; i++) {
            const dish = orderData[i];
            totalPrice += dish.price * dish.qty;
        }
        if (totalPrice < money) {
            return responseJson({
                res,
                statusCode: 400,
                msg: {
                    en: `Not enough money.`,
                    vn: `Số tiền không đủ.`,
                },
            });
        }
        change = totalPrice - money;

        // Update the status of orderModel to 'PAID' and update 'totalAmount' from 'totalPrice' and update 'change' from 'change'
        orderQuery.status = "PAID";
        orderQuery.totalAmount = totalPrice;
        orderQuery.change = change;
        await orderQuery.save();

        // Update the status of the tableQuery to false
        tableQuery.status = false;
        await tableQuery.save();

        return responseJson({
            res,
            statusCode: 200,
            msg: {
                en: `Order "${orderId}" paid successfully.`,
                vn: `Đã được thay đổi thành công.`,
            },
        });
    },
};
