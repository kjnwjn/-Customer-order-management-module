const { responseJson } = require("../../utils/response");
const { generateRandomString } = require("../../utils/index");
const categoryModel = require("../../models/category");
const dishModel = require("../../models/dish");

module.exports = {
    createNewDish: async (req, res, next) => {
        let dishId;
        let name = req.body.name ? req.body.name : null;
        let price = req.body.price ? req.body.price : null;
        let categoryId = req.body.categoryId ? req.body.price : null;
        let thumbnail = req.file ? req.file.filename : null;
        const categoryQuery = await categoryModel.findOne({ categoryId });
        do {
            dishId = generateRandomString(6);
        } while (await dishModel.findOne({ dishId }));
        if (!name) {
            return responseJson({
                res,
                msg: {
                    en: "name is required.",
                    vn: "Thất bại",
                },
            });
        }
        if (!price) {
            return responseJson({
                res,
                msg: {
                    en: "price is required.",
                    vn: "Thất bại.",
                },
            });
        }
        if (!categoryId) {
            return responseJson({
                res,
                msg: {
                    en: "category is required.",
                    vn: "Thất bại.",
                },
            });
        }
        if (!categoryQuery) {
            return responseJson({
                res,
                msg: {
                    en: "category cannot be found.",
                    vn: "Thất bại.",
                },
            });
        }

        // Save new dish to database
        const newDish = new dishModel({
            dishId,
            name,
            price,
            categoryId,
            thumbnail,
        });
        await newDish.save();
        return responseJson({
            res,
            status: true,
            msg: {
                en: "dish created successfully.",
                vn: "Thành công",
            },
        });
    },
    updateDishStatus: async (req, res, next) => {
        const dishId = req.body.dishId || req.params.dishId || req.query.dishId || null;
        const statusToUpdate = req.body.statusToUpdate || false;
        const dishQuery = await dishModel.findOne({ dishId });
        if (!dishId) {
            return responseJson({
                res,
                msg: {
                    en: "dishId is required.",
                    vn: "Thất bại.",
                },
            });
        }
        if (!dishQuery) {
            return responseJson({
                res,
                msg: {
                    en: "dish cannot be found.",
                    vn: "Thất bại.",
                },
            });
        }

        // Update dish status from statusToUpdate by dishId
        await dishModel.updateOne({ dishId }, { status: statusToUpdate }, (err, result) => {
            if (err) {
                console.log("🚀 ~ file: dish.js:98 ~ awaitdishModel.updateOne ~ err:", err);
                return responseJson({
                    res,
                    status: false,
                    statusCode: 500,
                    msg: {
                        en: "An error occurred while updating",
                        vn: "Thất bại.",
                    },
                });
            } else {
                return responseJson({
                    res,
                    status: true,
                    msg: {
                        en: "dish status updated successfully.",
                        vn: "Thành công",
                    },
                });
            }
        });
    },
};
