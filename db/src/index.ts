import { PrismaClient } from '@prisma/client';
import { Context } from './index.d';

const prisma = new PrismaClient();

export const createContext = (): Context => {
  return { prisma };
};
