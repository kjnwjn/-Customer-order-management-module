const Router = require("express").Router();
const authentication = require("../middleware/authentication");

const { login, logout, newAccount, getAllAccount, refreshToken } = require("./modules/account");
const { generateToken, getAccessToken } = require("./modules/test");
const { newOrder, removeOrder, addToCart } = require("./modules/order");
const { newTable, getAllTable } = require("./modules/table");
const { newCategory, removeCategory, updateCategory } = require("./modules/category");
const { createNewDish, updateDishStatus } = require("./modules/dish");
const { admin } = require("../middleware/authorization");
const multerUpload = require("../utils/multer");

/**
 * Account ================================================================
 */

Router.post("/account/login", login);
Router.get("/account/logout", authentication, logout);
Router.post("/account/new-account", authentication, admin, newAccount);
Router.get("/account/get-all-account", authentication, admin, getAllAccount);
Router.get("/account/refresh-token", refreshToken);

/**
 * Category ================================================================
 */
Router.post("/category/new-category", authentication, admin, newCategory);
Router.delete("/category/remove-category", authentication, admin, removeCategory);
Router.put("/category/update-category", authentication, admin, updateCategory);

/**
 * Order ================================================================
 */

Router.post("/order/new", authentication, admin, newOrder);
Router.delete("/order/remove-order", authentication, removeOrder);
Router.put("/order/update-order", authentication, addToCart);

/**
 * Table ================================================================
 */

Router.post("/table/new-table", authentication, newTable);
Router.get("/table/get-all", getAllTable);

/**
 * Dish ================================================================
 */
Router.post("/dish/new-dish", multerUpload, createNewDish);
Router.put("/dish/update-dish-status", authentication, updateDishStatus);

/**
 * Test ================================================================
 */

Router.get("/token/generateToken", generateToken);
Router.get("/token/getAccessToken", getAccessToken);
Router.post("/test/upload", multerUpload, (req, res, next) => {
    console.log("🚀 ~ file: api.js:39 ~ Router.post ~ req:", req.file);
    res.end("Upload test");
});

module.exports = Router;
