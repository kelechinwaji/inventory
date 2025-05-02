"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryController = void 0;
const inventory_service_1 = require("../services/inventory.service");
const asyncErrorHandler_1 = require("../utils/asyncErrorHandler");
class InventoryController {
    constructor() {
        this.addInventoryItem = (0, asyncErrorHandler_1.asyncErrorHandler)(async (req, res) => {
            const { item } = req.params;
            const { quantity, expiry } = req.body;
            if (!quantity || !expiry) {
                return res
                    .status(400)
                    .json({ error: "Quantity and expiry are required." });
            }
            await this.inventoryService.addItem(item, quantity, expiry);
            return res.status(200).json({});
        });
        this.sellInventoryItem = (0, asyncErrorHandler_1.asyncErrorHandler)(async (req, res) => {
            const { item } = req.params;
            const { quantity } = req.body;
            if (!quantity || quantity <= 0) {
                return res
                    .status(400)
                    .json({ error: "Quantity must be a positive number." });
            }
            await this.inventoryService.sellItem(item, quantity);
            return res.status(200).json({});
        });
        this.getInventoryQuantity = (0, asyncErrorHandler_1.asyncErrorHandler)(async (req, res) => {
            const { item } = req.params;
            const result = await this.inventoryService.getItemQuantity(item);
            return res.status(200).json(result);
        });
        this.inventoryService = new inventory_service_1.InventoryService();
    }
}
exports.InventoryController = InventoryController;
