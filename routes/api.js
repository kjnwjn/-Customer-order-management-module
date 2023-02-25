const Router = require("express").Router();
const authentication = require("../middleware/authentication");

const { login, logout, newAccount, getAllUsers } = require("./modules/account");
const { generateToken, getAccessToken } = require("./modules/test");
const { admin } = require("../middleware/authorization");

/**
 * Account ================================================================
 */

Router.post("/account/login", login);
Router.get("/account/logout", authentication, logout);
Router.post("/account/newAccount", authentication, admin, newAccount);
Router.get("/account/get-all-users", authentication, admin, getAllUsers);

/**
 * Test ================================================================
 */

Router.get("/token/generateToken", generateToken);
Router.get("/token/getAccessToken", getAccessToken);

module.exports = Router;
