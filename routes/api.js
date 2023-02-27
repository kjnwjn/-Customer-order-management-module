const Router = require("express").Router();
const authentication = require("../middleware/authentication");

const { login, logout, newAccount, getAllAccount } = require("./modules/account");
const { generateToken, getAccessToken } = require("./modules/test");
const { newOrder } = require("./modules/order");
const { newTable } = require("./modules/table");
const { admin } = require("../middleware/authorization");

/**
 * Account ================================================================
 */

Router.post("/account/login", login);
Router.get("/account/logout", authentication, logout);
Router.post("/account/new-account", authentication, admin, newAccount);
Router.get("/account/get-all-account", authentication, admin, getAllAccount);

/**
 * Order ================================================================
 */

Router.post("/order/new", authentication, admin, newOrder);

/**
 * Table ================================================================
 */

Router.post("/table/new-table", authentication, admin, newTable);

/**
 * Test ================================================================
 */

Router.get("/token/generateToken", generateToken);
Router.get("/token/getAccessToken", getAccessToken);

module.exports = Router;
