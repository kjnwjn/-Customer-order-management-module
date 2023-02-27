const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const orderSchema = new mongoose.Schema(
    {
        orderId: {
            type: Number,
            require: true,
            unique: true,
        },
        status: {
            type: String,
            require: true,
            default: "INITIAL",
        },
        totalAmount: {
            type: Number,
            require: true,
            default: 0,
        },
        userCode: {
            type: String,
            require: true,
        },
        tableId: {
            type: Number,
            require: true,
        },
        orderData: {
            type: Array,
            require: true,
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

orderSchema.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: "all",
});

module.exports = mongoose.model("Order", orderSchema);
