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
};
