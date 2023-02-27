require("dotenv").config();
var { connect } = require("./configs/db");

var cors = require("cors");
var path = require("path");
var logger = require("morgan");
var express = require("express");
var createError = require("http-errors");
var cookieParser = require("cookie-parser");
var swaggerAutogen = require("swagger-autogen")();

var { responseJson } = require("./utils/response");
var defineRoute = require("./routes/index");
const outputFile = "./utils/swagger_output.json";
const endpointsFiles = ["./routes/api.js"];
const corsOptions = { origin: "*", optionsSuccessStatus: 200 };

var app = express();
connect();
app.use(cors(corsOptions));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// define api docs
const doc = {
    info: {
        title: "Customer order management module",
        description: "Description",
    },
    host: `localhost:${process.env.PORT}/api/v1`,
    schemes: ["http"],
};
swaggerAutogen(outputFile, endpointsFiles, doc);

defineRoute(app);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    return responseJson({
        status: false,
        statusCode: err.status || 500,
        msg: { en: err.message, vn: err.message },
        data: {},
        res,
    });
});

module.exports = app;
