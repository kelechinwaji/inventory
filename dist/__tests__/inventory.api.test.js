"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const prisma_1 = require("../utils/prisma"); // your real prisma connection
describe("Inventory API", () => {
    beforeEach(async () => {
        // clean database before each test
        await prisma_1.prisma.inventory.deleteMany();
    });
    afterAll(async () => {
        await prisma_1.prisma.$disconnect();
    });
    it("should add a new inventory item", async () => {
        const response = await (0, supertest_1.default)(app_1.default)
            .post("/foo/add")
            .send({
            quantity: 10,
            expiry: Date.now() + 10000, // 10 seconds from now
        });
        expect(response.statusCode).toBe(200);
        const items = await prisma_1.prisma.inventory.findMany({
            where: { itemName: "foo" },
        });
        expect(items.length).toBe(1);
        expect(items[0].quantity).toBe(10);
    });
    it("should get inventory quantity", async () => {
        // first add
        await prisma_1.prisma.inventory.create({
            data: {
                itemName: "foo",
                quantity: 5,
                expiry: new Date(Date.now() + 10000),
            },
        });
        const response = await (0, supertest_1.default)(app_1.default).get("/foo/quantity");
        expect(response.statusCode).toBe(200);
        expect(response.body.quantity).toBe(5);
        expect(response.body.validTill).toBeGreaterThan(Date.now());
    });
    it("should sell inventory items correctly", async () => {
        await prisma_1.prisma.inventory.create({
            data: {
                itemName: "foo",
                quantity: 5,
                expiry: new Date(Date.now() + 10000),
            },
        });
        const response = await (0, supertest_1.default)(app_1.default).post("/foo/sell").send({ quantity: 3 });
        expect(response.statusCode).toBe(200);
        const remaining = await prisma_1.prisma.inventory.findMany({
            where: { itemName: "foo" },
        });
        expect(remaining[0].quantity).toBe(2);
    });
});
