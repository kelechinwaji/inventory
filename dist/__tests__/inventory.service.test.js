"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const inventory_service_1 = require("../services/inventory.service");
const prisma_1 = require("../utils/__mocks__/prisma");
jest.mock("../utils/prisma", () => ({
    prisma: require("../utils/__mocks__/prisma").prisma,
}));
const prisma = prisma_1.prisma;
describe("InventoryService", () => {
    const service = new inventory_service_1.InventoryService();
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it("should add an inventory item", async () => {
        await service.addItem("foo", 10, Date.now());
        expect(prisma.inventory.create).toHaveBeenCalledTimes(1);
        expect(prisma.inventory.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                itemName: "foo",
                quantity: 10,
            }),
        }));
    });
    it("should get inventory quantity", async () => {
        prisma.inventory.findMany.mockResolvedValue([
            { quantity: 5, expiry: new Date(Date.now() + 10000) },
            { quantity: 3, expiry: new Date(Date.now() + 20000) },
        ]);
        const result = await service.getItemQuantity("foo");
        expect(result.quantity).toBe(8);
        expect(result.validTill).toBeDefined();
    });
    it("should throw an error if selling more than available", async () => {
        prisma.inventory.findMany.mockResolvedValue([
            { id: "1", quantity: 2, expiry: new Date(Date.now() + 10000) },
        ]);
        await expect(service.sellItem("foo", 5)).rejects.toThrow("Not enough inventory to sell.");
    });
    it("should sell inventory properly", async () => {
        prisma.inventory.findMany.mockResolvedValue([
            { id: "1", quantity: 5, expiry: new Date(Date.now() + 10000) },
            { id: "2", quantity: 10, expiry: new Date(Date.now() + 20000) },
        ]);
        prisma.inventory.delete.mockResolvedValue({});
        prisma.inventory.update.mockResolvedValue({});
        await service.sellItem("foo", 8);
        expect(prisma.inventory.delete).toHaveBeenCalledTimes(1);
        expect(prisma.inventory.update).toHaveBeenCalledTimes(1);
    });
});
