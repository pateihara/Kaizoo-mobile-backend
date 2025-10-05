//src/server/prisma.ts
import { PrismaClient } from "@prisma/client";
export const prisma = new PrismaClient();

process.on("beforeExit", async () => {
    try { await prisma.$disconnect(); } catch { }
});
