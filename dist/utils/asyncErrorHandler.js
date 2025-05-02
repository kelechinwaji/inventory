"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncErrorHandler = void 0;
const errors_1 = require("./errors");
const asyncErrorHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch((err) => {
            if (err instanceof errors_1.BadRequestError) {
                return res.status(400).json({ error: err.message });
            }
            console.error(err); // still log unexpected errors
            return res.status(500).json({ error: "Internal Server Error" });
        });
    };
};
exports.asyncErrorHandler = asyncErrorHandler;
