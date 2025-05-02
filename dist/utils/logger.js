"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
// src/utils/logger.ts
const winston_1 = require("winston");
exports.logger = (0, winston_1.createLogger)({
    level: 'info',
    format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.printf(({ timestamp, level, message }) => {
        return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })),
    transports: [
        new winston_1.transports.Console(),
        // Optional: Add file logging
        // new transports.File({ filename: 'combined.log' }),
    ],
});
