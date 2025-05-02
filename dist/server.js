"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const clearExpiredLots_1 = require("./cron/clearExpiredLots");
const inventory_routes_1 = __importDefault(require("./routes/inventory.routes"));
const error_middleware_1 = require("./middlewares/error.middleware");
const logger_1 = require("./utils/logger");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(express_1.default.json());
// Routes
app.use("/inventory", inventory_routes_1.default);
(0, clearExpiredLots_1.scheduleClearExpiredLots)();
// Global Error Middleware (last middleware)
app.use(error_middleware_1.errorMiddleware);
app.listen(PORT, () => {
    logger_1.logger.info(`Server running on port ${PORT}`);
});
