import { Router } from "express";
import { InventoryController } from "../controllers/inventory.controller";

const router = Router();
const inventoryController = new InventoryController();

router.post("/:item/add", inventoryController.addInventoryItem);
router.post("/:item/sell", inventoryController.sellInventoryItem);
router.get('/:item/quantity', inventoryController.getInventoryQuantity);


export default router;
