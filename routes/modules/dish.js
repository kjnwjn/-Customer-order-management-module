const { responseJson } = require("../../utils/response");
const { generateRandomString } = require("../../utils/index");
const categoryModel = require("../../models/category");
const dishModel = require("../../models/dish");
const socket = require("../../bin/www");

module.exports = {
    createNewDish: async (req, res, next) => {
        // #swagger.tags = ['Dish']

        /*
          #swagger.consumes = ['multipart/form-data']  
          #swagger.parameters['thumbnail'] = {
              in: 'formData',
              type: 'file',
              required: 'true',
              description: 'Some description...',
        } */

        /*
          #swagger.consumes = ['multipart/form-data']  
          #swagger.parameters['name'] = {
              in: 'formData',
              type: 'String',
              description: 'Some description...',
        } */
        /*
          #swagger.consumes = ['multipart/form-data']  
          #swagger.parameters['price'] = {
              in: 'formData',
              type: 'Number',
              description: 'Some description...',
        } */
        /*
          #swagger.consumes = ['multipart/form-data']  
          #swagger.parameters['categoryId'] = {
              in: 'formData',
              type: 'String',
              description: 'Some description...',
        } */

        let dishId;
        let name = req.body.name ? req.body.name : null;
        let price = req.body.price ? req.body.price : null;
        let categoryId = req.body.categoryId ? req.body.categoryId : null;
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
        // #swagger.tags = ['Dish']
        try {
            const dishId = req.query.dishId || null;
            const dishQuery = await dishModel.findOne({ dishId });

            if (!dishId || typeof dishId !== "string") {
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
            await dishModel.updateOne({ dishId }, { status: !dishQuery.status }, (err, result) => {
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
                    socket.io.emit("update-status-dish", {
                        dishId,
                        status: !dishQuery.status,
                    });
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
        } catch (error) {
            return responseJson({
                res,
                statusCode: 500,
                msg: { en: error.message },
            });
        }
    },
};
