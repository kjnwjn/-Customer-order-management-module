const Router = require("express").Router();
const authentication = require("../middleware/authentication");

const { login, logout } = require("./modules/account");

/**
 * Account ================================================================
 */

Router.post("/account/login", login);
Router.get("/account/logout", authentication, logout);

module.exports = Router;
