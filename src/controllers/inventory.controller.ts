import { Request, Response } from "express";
import { InventoryService } from "../services/inventory.service";
import { asyncErrorHandler } from "../utils/asyncErrorHandler";

export class InventoryController {
  private inventoryService: InventoryService;

  constructor() {
    this.inventoryService = new InventoryService();
  }

  public addInventoryItem = asyncErrorHandler(
    async (req: Request, res: Response) => {
      const { item } = req.params;
      const { quantity, expiry } = req.body;

      if (!quantity || !expiry) {
        return res
          .status(400)
          .json({ error: "Quantity and expiry are required." });
      }

      await this.inventoryService.addItem(item, quantity, expiry);
      return res.status(200).json({});
    }
  );

  public sellInventoryItem = asyncErrorHandler(
    async (req: Request, res: Response) => {
      const { item } = req.params;
      const { quantity } = req.body;

      if (!quantity || quantity <= 0) {
        return res
          .status(400)
          .json({ error: "Quantity must be a positive number." });
      }

      await this.inventoryService.sellItem(item, quantity);
      return res.status(200).json({});
    }
  );
//
  public getInventoryQuantity = asyncErrorHandler(
    async (req: Request, res: Response) => {
      const { item } = req.params;

      const result = await this.inventoryService.getItemQuantity(item);
      return res.status(200).json(result);
    }
  );
}
