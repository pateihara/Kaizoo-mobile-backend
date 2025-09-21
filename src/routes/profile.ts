//src/routes/profile.ts
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

const finishSchema = z.object({
    // opcional: salve a escolha do Kaizoo/mascote
    kaizoo: z.string().min(1).optional(),
});

/**
 * POST /profile/finish-onboarding
 * Marca profileReady=true e (opcional) salva o campo kaizoo
 * Requer Authorization: Bearer <ACCESS_TOKEN>
 */
router.post("/finish-onboarding", requireAuth, async (req, res) => {
    const parsed = finishSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
    }

    const user = await prisma.user.update({
        where: { id: req.userId! },
        data: {
            profileReady: true,
            ...(parsed.data.kaizoo ? { kaizoo: parsed.data.kaizoo } : {}),
        },
        select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            profileReady: true,
            kaizoo: true,
        },
    });

    return res.json({ user });
});

export default router;
