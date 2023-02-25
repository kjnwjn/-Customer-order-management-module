const { responseJson } = require("../../utils/response");

module.exports = {
    generateToken: async function (req, res, next) {
        var io = req.app.get("socketio");
        let r = (Math.random() + 1).toString(36).substring(7);
        io.emit("response", r);
        res.end("dsadsa");
    },
    getAccessToken: async function (req, res, next) {
        const token = req.query.token || req.headers["x-access-token"] || req.cookies.token;

        responseJson({
            res,
            status: true,
            statusCode: 200,
            msg: { en: "Get token successfully!", vn: "Lay token  thành công." },
            data: {
                token,
            },
        });
    },
};
