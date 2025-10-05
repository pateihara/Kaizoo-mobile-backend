//prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();

async function main() {
    const email = "admin@kaizoo.app";
    const passwordHash = await bcrypt.hash("secret123", 10);
    await prisma.user.upsert({
        where: { email },
        update: {},
        create: { email, passwordHash, profileReady: true, name: "Admin Kaizoo" },
    });
    console.log("Seed ok:", email, "(senha: secret123)");
}

main().finally(() => prisma.$disconnect());
