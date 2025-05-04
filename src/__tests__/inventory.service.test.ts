import { InventoryService } from "../services/inventory.service";
import { prisma as mockPrisma } from "../utils/__mocks__/prisma";

jest.mock("../utils/prisma", () => ({
  prisma: require("../utils/__mocks__/prisma").prisma,
}));

const prisma = mockPrisma;

describe("InventoryService", () => {
  const service = new InventoryService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should add an inventory item", async () => {
    await service.addItem("foo", 10, Date.now());

    expect(prisma.inventory.create).toHaveBeenCalledTimes(1);
    expect(prisma.inventory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          itemName: "foo",
          quantity: 10,
        }),
      })
    );
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

    await expect(service.sellItem("foo", 5)).rejects.toThrow(
      "Not enough inventory to sell."
    );
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

  it("should properly handle multiple sequential sell calls (FIFO)", async () => {
    const now = new Date();
    const future1 = new Date(now.getTime() + 10 * 1000);
    const future2 = new Date(now.getTime() + 20 * 1000);

    // Initial lots: 5 from lot 1, 10 from lot 2
    prisma.inventory.findMany
      .mockResolvedValueOnce([
        { id: "1", quantity: 5, expiry: future1 },
        { id: "2", quantity: 10, expiry: future2 },
      ]) // First sell: 7 units
      .mockResolvedValueOnce([
        { id: "2", quantity: 8, expiry: future2 }, // After lot 1 deleted, lot 2 reduced
      ]); // Second sell: 8 units

    prisma.inventory.delete.mockResolvedValue({});
    prisma.inventory.update.mockResolvedValue({});

    // First call - should sell 5 from lot 1 (deleted), 2 from lot 2 (updated)
    await service.sellItem("foo", 7);

    expect(prisma.inventory.delete).toHaveBeenCalledWith({
      where: { id: "1" },
    });
    expect(prisma.inventory.update).toHaveBeenCalledWith({
      where: { id: "2" },
      data: { quantity: 8 },
    });

    jest.clearAllMocks(); // Reset mocks before next test step

    // Second call - sell remaining 8
    await service.sellItem("foo", 8);

    // All from lot 2 should be sold now
    expect(prisma.inventory.delete).toHaveBeenCalledWith({
      where: { id: "2" },
    });
  });
});
