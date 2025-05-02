import express from "express";
import { scheduleClearExpiredLots } from "./cron/clearExpiredLots";
import inventoryRoutes from "./routes/inventory.routes";
import { errorMiddleware } from "./middlewares/error.middleware";
import { logger } from "./utils/logger";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Routes
app.use("/inventory", inventoryRoutes);
scheduleClearExpiredLots();

// Global Error Middleware (last middleware)
app.use(errorMiddleware);

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
