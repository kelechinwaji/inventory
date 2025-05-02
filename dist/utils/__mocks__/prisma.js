"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const prismaMock = {
    inventory: {
        create: jest.fn(),
        findMany: jest.fn(),
        delete: jest.fn(),
        update: jest.fn(),
    },
};
prismaMock.$transaction = jest.fn((fn) => fn(prismaMock));
exports.prisma = prismaMock;
