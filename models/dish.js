const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const dishSchema = new mongoose.Schema(
    {
        dishId: {
            type: String,
            require: true,
            unique: true,
        },
        name: {
            type: String,
            require: true,
        },
        status: {
            type: Boolean,
            require: true,
        },
        price: {
            type: Number,
            require: true,
        },
        categoryId: {
            type: String,
            require: true,
        },
    },
    {
        timestamps: true,
    }
);

dishSchema.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: "all",
});

module.exports = mongoose.model("Dish", dishSchema);
