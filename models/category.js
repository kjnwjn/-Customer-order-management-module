const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const categorySchema = new mongoose.Schema(
    {
        categoryId: {
            type: String,
            require: true,
            unique: true,
        },
        name: {
            type: String,
            require: true,
        },
    },
    {
        timestamps: true,
    }
);

categorySchema.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: "all",
});

module.exports = mongoose.model("Category", menuSchema);
