"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const errorMiddleware = (err, req, res, next) => {
    console.error('Global Error:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
    });
};
exports.errorMiddleware = errorMiddleware;
