import { PrismaClient } from '@prisma/client';

declare global {
  const __prisma: PrismaClient | undefined;
}

// @ts-expect-error cannot solve this issue - only appears to be a typescript error
if (!globalThis.__prisma) {
  // @ts-expect-error cannot solve this issue - only appears to be a typescript error
  globalThis.__prisma = new PrismaClient();
}

// @ts-expect-error cannot solve this issue - only appears to be a typescript error
const prisma: PrismaClient = globalThis.__prisma;

export { prisma };
