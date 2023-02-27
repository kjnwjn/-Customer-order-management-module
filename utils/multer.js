/* Middleware for multer storage upload */
const multer = require("multer");
const { v4 } = require("uuid");
const { responseJson } = require("./response");

const storageMulter = (req, res, next) => {
    const upload = multer({
        storage: multer.diskStorage({
            destination: (req, res, callback) => {
                callback(null, "./public/uploads");
            },
            filename: (req, file, callback) => {
                const id = v4();
                callback(null, `${id}_${file.originalname}`);
            },
        }),
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: (req, file, callback) => {
            console.log(file);
            const validMimeType = file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg";
            if (validMimeType) {
                callback(null, true);
            } else {
                callback(null, false);
                const err = new Error("Extension Error");
                err.message = "Only *.jpg, *.jpeg, *.png are allowed.";
                return callback(err);
            }
        },
    }).single("thumbnail");

    upload(req, res, (err) => {
        if (err) {
            return responseJson({
                res,
                msg: { en: err.message, vn: "Thất bại" },
            });
        } else {
            next();
        }
    });
};

module.exports = storageMulter;
