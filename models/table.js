const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");
const { autoIncrement } = require("../configs/db");

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
    },
    {
        timestamps: true,
    }
);

tableSchema.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: "all",
});
tableSchema.plugin(autoIncrement.plugin, {
    model: "Table",
    field: "tableId",
    startAt: 1,
    incrementBy: 1,
});

module.exports = mongoose.model("Table", tableSchema);
