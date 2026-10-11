import { PrismaClient } from "@prisma/client";

// Cliente Prisma único (singleton) para toda la app
export const prisma = new PrismaClient();
