"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanExpiredLots = cleanExpiredLots;
exports.scheduleClearExpiredLots = scheduleClearExpiredLots;
const node_cron_1 = __importDefault(require("node-cron"));
const prisma_1 = require("../utils/prisma");
const logger_1 = require("../utils/logger");
async function cleanExpiredLots() {
    const now = new Date();
    const result = await prisma_1.prisma.inventory.deleteMany({
        where: {
            expiry: {
                lte: now,
            },
        },
    });
    logger_1.logger.info(`[Cleaner] Cleaned ${result.count} expired lots`);
}
function scheduleClearExpiredLots() {
    node_cron_1.default.schedule("*/5 * * * *", async () => {
        logger_1.logger.info("[Cleaner] Running scheduled task...");
        await cleanExpiredLots();
    });
}
