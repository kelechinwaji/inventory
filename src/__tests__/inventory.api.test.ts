import request from "supertest";
import app from "../app";
import { prisma } from "../utils/prisma"; // your real prisma connection

describe("Inventory API", () => {
  beforeEach(async () => {
    // clean database before each test
    await prisma.inventory.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should add a new inventory item", async () => {
    const response = await request(app)
      .post("/foo/add")
      .send({
        quantity: 10,
        expiry: Date.now() + 10000, // 10 seconds from now
      });

    expect(response.statusCode).toBe(200);

    const items = await prisma.inventory.findMany({
      where: { itemName: "foo" },
    });
    expect(items.length).toBe(1);
    expect(items[0].quantity).toBe(10);
  });

  it("should get inventory quantity", async () => {
    // first add
    await prisma.inventory.create({
      data: {
        itemName: "foo",
        quantity: 5,
        expiry: new Date(Date.now() + 10000),
      },
    });

    const response = await request(app).get("/foo/quantity");

    expect(response.statusCode).toBe(200);
    expect(response.body.quantity).toBe(5);
    expect(response.body.validTill).toBeGreaterThan(Date.now());
  });

  it("should sell inventory items correctly", async () => {
    await prisma.inventory.create({
      data: {
        itemName: "foo",
        quantity: 5,
        expiry: new Date(Date.now() + 10000),
      },
    });

    const response = await request(app).post("/foo/sell").send({ quantity: 3 });

    expect(response.statusCode).toBe(200);

    const remaining = await prisma.inventory.findMany({
      where: { itemName: "foo" },
    });
    expect(remaining[0].quantity).toBe(2);
  });
});
