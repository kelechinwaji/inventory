"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const errors_1 = require("../utils/errors");
const prisma_1 = require("../utils/prisma");
class InventoryService {
    async addItem(itemName, quantity, expiry) {
        await prisma_1.prisma.inventory.create({
            data: {
                itemName,
                quantity,
                expiry: new Date(expiry),
            },
        });
    }
    async sellItem(itemName, quantityToSell) {
        const now = new Date();
        await prisma_1.prisma.$transaction(async (tx) => {
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
                throw new errors_1.BadRequestError("Not enough inventory to sell.");
            }
            let remainingQuantity = quantityToSell;
            for (const lot of lots) {
                if (remainingQuantity <= 0)
                    break;
                if (lot.quantity <= remainingQuantity) {
                    // Delete the entire lot
                    await tx.inventory.delete({
                        where: { id: lot.id },
                    });
                    remainingQuantity -= lot.quantity;
                }
                else {
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
    async getItemQuantity(itemName) {
        const now = new Date();
        const lots = await prisma_1.prisma.inventory.findMany({
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
exports.InventoryService = InventoryService;
