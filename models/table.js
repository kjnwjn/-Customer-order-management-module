const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const tableSchema = new mongoose.Schema(
    {
        tableId: {
            type: Number,
            require: true,
            unique: true,
        },
        status: {
            type: Boolean,
            require: true,
            default: false,
        },
        guestNumbs: {
            type: Number,
            require: true,
            default: 1,
        }, // ko can
    },
    {
        timestamps: true,
    }
);

tableSchema.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: "all",
});

module.exports = mongoose.model("Table", tableSchema);
