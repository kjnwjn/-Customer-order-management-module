const Router = require("express").Router();
const authentication = require("../middleware/authentication");

const { login, logout } = require("./modules/account");

Router.post("/login", login);
Router.post("/logout", authentication, logout);

module.exports = Router;
