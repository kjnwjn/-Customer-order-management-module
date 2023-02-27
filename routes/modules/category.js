const { responseJson } = require("../../utils/response");
const { generateRandomString } = require("../../utils/index");
const categoryModel = require("../../models/category");

module.exports = {
    newCategory: async (req, res, next) => {
        // #swagger.tags = ['Category']
        let categoryId;
        let name = req.body.name ? req.body.name : null;
        if (!name) {
            return responseJson({
                res,
                status: false,
                msg: {
                    en: `name is required`,
                    vn: "Thất bại!",
                },
            });
        }
        do {
            categoryId = generateRandomString(6);
        } while (await categoryModel.findOne({ categoryId }));
        const newCategory = new categoryModel({ categoryId, name });
        await newCategory.save();
        return responseJson({
            res,
            status: true,
            msg: {
                en: `Create a new category for "${name}" successfully!`,
                vn: `Thành công!`,
            },
        });
    },
    removeCategory: (req, res, next) => {
        // #swagger.tags = ['Category']
        const { categoryId } = req.body || null;
        if (!categoryId) {
            return responseJson({
                res,
                status: false,
                msg: {
                    en: `categoryId is required`,
                    vn: "Thất bại!",
                },
            });
        }
        categoryModel.deleteOne({ categoryId }, (err, result) => {
            if (err) {
                return responseJson({
                    res,
                    status: false,
                    msg: {
                        en: `Remove category for "${categoryId}" failed!`,
                        vn: `Thất bại!`,
                    },
                });
            }
            return responseJson({
                res,
                status: true,
                msg: {
                    en: `Remove category for "${categoryId}" successfully!`,
                    vn: `Thành công!`,
                },
            });
        });
    },
    updateCategory: (req, res, next) => {
        // #swagger.tags = ['Category']
        const { categoryId, name } = req.body || null;
        if (!categoryId) {
            return responseJson({
                res,
                status: false,
                msg: {
                    en: `categoryId is required`,
                    vn: "Thất bại!",
                },
            });
        }
        if (!name) {
            return responseJson({
                res,
                status: false,
                msg: {
                    en: `name is required`,
                    vn: "Thất bại!",
                },
            });
        }
        categoryModel.updateOne({ categoryId }, { name }, (err, result) => {
            if (err) {
                return responseJson({
                    res,
                    status: false,
                    msg: {
                        en: `Update category for "${categoryId}" failed!`,
                        vn: `Thất bại!`,
                    },
                });
            }
            return responseJson({
                res,
                status: true,
                msg: {
                    en: `Update category for "${categoryId}" successfully!`,
                    vn: `Thành công!`,
                },
            });
        });
    },
};
