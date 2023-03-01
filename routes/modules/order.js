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
            console.log(checkUserCode && checkUserCode.status);
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
        const orderId = req.body.orderId ? req.body.orderId : null;
        // const dishId = req.query.dishId || req.body.dishId || null;
        // const quantity = req.query.quantity || req.body.quantity || 1;
        // const dishQuery = await dishModel.findOne({ dishId });
        const messages = req.body.messages.length > 0 ? req.body.messages : [];
        const orderData = req.body.orderData.length > 0 ? req.body.orderData : [];
        const orderQuery = await orderModel.findOne({ orderId });
        const dishAll = await dishModel.find({});
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
        let dishUnavailable = orderData.filter((orderItem) => {
            dishAll.forEach((dish) => {
                if (!(dish.id === orderItem.id && dish.status)) {
                    return true;
                }
                return false;
            });
        });
        if (dishUnavailable.length > 0) {
            console.log(dishUnavailable);
            console.log(false);
        } else {
            console.log(orderData);
            console.log(true);
        }
        res.end();

        // const isDishAvailable = orderData.filter((orderItem)=>{
        //     return  dishAll.filter((dish)=>{
        //         if(dish.id === orderItem.id && dish.status){
        //             return true;
        //         }else{
        //             dishUnavailable.push(dish);
        //             return false;
        //         }
        //         return true;
        //     })
        // })
        // if(dishUnavailable.length > 0){
        //     // THông báo cho khách hàng món hét
        // }
        // if(!isDishAvailable){
        //     return responseJson({
        //         res,
        //         msg: {
        //             en: `Exists 1 dish not available in order`,
        //             vn: `Tồn tại 1 món ăn không có sẵn trong đơn hàng, vui lòng kiểm tra lại }`,
        //         },
        //     });
        // }
        // if (!dishQuery.status) {
        //     return responseJson({
        //         res,
        //         msg: {
        //             en: `Dish "${dishId}" is not available.`,
        //             vn: `Không có sẵn.`,
        //         },
        //     });
        // }

        // // Add new dish queried to orderData of orderModel and check if dishId is existing then add old quantity with new quantity
        // // const orderData = orderQuery.orderData || [];
        // const dishIndex = orderData.findIndex((item) => item.dishId === dishId);
        // if (dishIndex >= 0) {
        //     const dish = orderData[dishIndex];
        //     dish.quantity += quantity;
        //     orderData[dishIndex] = dish;
        // } else {
        //     orderData.push({
        //         dishId,
        //         quantity,
        //     });
        // }
        // orderQuery.orderData = orderData;
        // await orderQuery.save();
        // return responseJson({
        //     res,
        //     statusCode: 200,
        //     msg: {
        //         en: `Added ${quantity} ${dishQuery.name} to cart.`,
        //         vn: `Đã thêm ${quantity} ${dishQuery.name} vào giỏ hàng.`,
        //     },
        // });
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
            totalPrice += dish.price * dish.quantity;
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
