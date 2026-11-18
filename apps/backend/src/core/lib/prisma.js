import { PrismaClient, Prisma } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

// Reuse a single client across nodemon reloads in dev to avoid exhausting DB connections.
const prisma = global.__prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

export { Prisma };
export default prisma;
