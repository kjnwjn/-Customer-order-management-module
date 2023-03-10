const apiRoute = require("./api");
const swaggerFile = require("../utils/swagger_output.json");
const swaggerUi = require("swagger-ui-express");
module.exports = function route(app) {
    app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));
    app.use("/api/v1", apiRoute);
};
