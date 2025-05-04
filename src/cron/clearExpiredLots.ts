import cron from "node-cron";
import { prisma } from "../utils/prisma";
import { logger } from "../utils/logger"; 

export async function cleanExpiredLots() {
  const now = new Date();

  const result = await prisma.inventory.deleteMany({
    where: {
      expiry: {
        lte: now,
      },
    },
  });

  logger.info(`[Cleaner] Cleaned ${result.count} expired lots`);
}

export function scheduleClearExpiredLots() {
  cron.schedule("*/10 * * * *", async () => {
    logger.info("[Cleaner] Running scheduled task...");
    await cleanExpiredLots();
  });
}
