const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const accountSchema = new mongoose.Schema(
    {
        userCode: {
            type: String,
            require: true,
            unique: true,
        },
        password: {
            type: String,
            require: true,
        },
        fullName: {
            type: String,
            require: true,
        },
        access_token: {
            type: String,
            default: "#N/A",
        },
        role: {
            type: String,
            default: "STAFF",
        },
    },
    {
        timestamps: true,
    }
);

accountSchema.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: "all",
});

module.exports = mongoose.model("Account", accountSchema);
