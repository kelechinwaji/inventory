import { BadRequestError } from "../utils/errors";
import { prisma } from "../utils/prisma";

export class InventoryService {
  async addItem(itemName: string, quantity: number, expiry: number) {
    await prisma.inventory.create({
      data: {
        itemName,
        quantity,
        expiry: new Date(expiry),
      },
    });
  }

  async sellItem(itemName: string, quantityToSell: number) {
    const now = new Date();

    await prisma.$transaction(async (tx) => {
      // 1. Fetch non-expired lots ordered by expiry ASC
      const lots = await tx.inventory.findMany({
        where: {
          itemName,
          expiry: { gt: now },
        },
        orderBy: {
          expiry: "asc",
        },
      });

      const totalAvailable = lots.reduce((sum, lot) => sum + lot.quantity, 0);

      if (totalAvailable < quantityToSell) {
        throw new BadRequestError("Not enough inventory to sell.");
      }

      let remainingQuantity = quantityToSell;

      for (const lot of lots) {
        if (remainingQuantity <= 0) break;

        if (lot.quantity <= remainingQuantity) {
          // Delete the entire lot
          await tx.inventory.delete({
            where: { id: lot.id },
          });
          remainingQuantity -= lot.quantity;
        } else {
          // Update the lot with reduced quantity
          await tx.inventory.update({
            where: { id: lot.id },
            data: {
              quantity: lot.quantity - remainingQuantity,
            },
          });
          remainingQuantity = 0;
        }
      }
    });
  }

  async getItemQuantity(itemName: string) {
    const now = new Date();

    const lots = await prisma.inventory.findMany({
      where: {
        itemName,
        expiry: { gt: now },
      },
      orderBy: {
        expiry: "asc",
      },
    });

    if (lots.length === 0) {
      return {
        quantity: 0,
        validTill: null,
      };
    }

    const totalQuantity = lots.reduce((sum, lot) => sum + lot.quantity, 0);

    return {
      quantity: totalQuantity,
      validTill: lots[0].expiry.getTime(), // earliest expiry
    };
  }
}
