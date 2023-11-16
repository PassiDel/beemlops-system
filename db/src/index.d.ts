import { PrismaClient } from '@prisma/client';

export function createContext(): Context;

export * from '.prisma/client/index.d';

export interface Context {
  prisma: PrismaClient;
}
