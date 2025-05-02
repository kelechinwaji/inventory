type PrismaMockType = {
  inventory: {
    create: jest.Mock;
    findMany: jest.Mock;
    delete: jest.Mock;
    update: jest.Mock;
  };
  $transaction?: jest.Mock;
};

const prismaMock: PrismaMockType = {
  inventory: {
    create: jest.fn(),
    findMany: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  },
};

prismaMock.$transaction = jest.fn((fn: any) => fn(prismaMock));

export const prisma = prismaMock;
