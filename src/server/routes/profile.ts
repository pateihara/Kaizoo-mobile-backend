// src/server/routes/profile.ts
import { Router } from "express";
import { z } from "zod";
import { requireAuth, AuthReq } from "../middleware/auth.js";

export type MascotKey = "tato" | "dino" | "koa" | "kaia" | "penny";

type Profile = {
    userId: string;
    onboardingCompleted: boolean;
    mascot?: MascotKey;
    quiz?: { goal?: string; freq?: string; likes: string[] };
};

const profiles = new Map<string, Profile>();
const router = Router();

router.get("/", requireAuth, (req: AuthReq, res) => {
    const userId = req.userId!;
    const p = profiles.get(userId) ?? { userId, onboardingCompleted: false };
    profiles.set(userId, p);
    res.json(p);
});

router.post("/onboarding", requireAuth, (req: AuthReq, res) => {
    const body = z.object({ mascot: z.enum(["tato", "dino", "koa", "kaia", "penny"]) }).parse(req.body);
    const userId = req.userId!;
    const p: Profile = profiles.get(userId) ?? { userId, onboardingCompleted: false };
    p.mascot = body.mascot;
    p.onboardingCompleted = true;
    profiles.set(userId, p);
    res.json(p);
});

router.post("/preferences", requireAuth, (req: AuthReq, res) => {
    const body = z.object({
        goal: z.string().min(1),
        freq: z.string().min(1),
        likes: z.array(z.string()).min(1),
    }).parse(req.body);

    const userId = req.userId!;
    const p: Profile = profiles.get(userId) ?? { userId, onboardingCompleted: false };
    p.quiz = body;
    profiles.set(userId, p);
    res.json(p);
});

export default router;
