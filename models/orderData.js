const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const orderDataSchema = new mongoose.Schema(
    {
        orderId: {
            type: Number,
            require: true,
        },
        dishId: {
            type: String,
            require: true,
        },
        status: {
            type: Boolean,
            default: false,
        },
        qty: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

orderDataSchema.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: "all",
});

module.exports = mongoose.model("orderData", orderDataSchema);
