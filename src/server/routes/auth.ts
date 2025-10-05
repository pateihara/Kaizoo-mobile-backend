// src/server/routes/auth.ts
import { Router } from "express";
import { prisma } from "../prisma.js";
import { z } from "zod";
import { comparePassword, hashPassword, sha256, randomId } from "../utils/hash.js";
import { signAccessToken, signRefreshToken, verifyRefresh } from "../utils/jwt.js";
import { addDays } from "date-fns";
import { requireAuth, AuthReq } from "../../middleware/auth.js";

const router = Router();

const creds = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

router.post("/register", async (req, res) => {
    const parsed = creds.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error.flatten());

    const { email, password } = parsed.data;

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ error: "email_in_use" });

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({ data: { email, passwordHash } });

    const jti = randomId();
    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id, jti);

    await prisma.refreshToken.create({
        data: {
            userId: user.id,
            tokenHash: sha256(refreshToken),
            expiresAt: addDays(new Date(), 7),
        },
    });

    res.json({
        user: { id: user.id, email: user.email },
        accessToken,
        refreshToken,
    });
});

router.post("/login", async (req, res) => {
    const parsed = creds.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error.flatten());

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "invalid_credentials" });

    const ok = await comparePassword(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "invalid_credentials" });

    const jti = randomId();
    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id, jti);

    await prisma.refreshToken.create({
        data: {
            userId: user.id,
            tokenHash: sha256(refreshToken),
            expiresAt: addDays(new Date(), 7),
        },
    });

    res.json({
        user: { id: user.id, email: user.email },
        accessToken,
        refreshToken,
    });
});

router.post("/refresh", async (req, res) => {
    const token = String(req.body?.refreshToken || "");
    if (!token) return res.status(400).json({ error: "missing_refresh" });

    try {
        const payload = verifyRefresh(token);

        const row = await prisma.refreshToken.findFirst({
            where: { tokenHash: sha256(token), revoked: false },
        });
        if (!row || row.expiresAt < new Date()) {
            return res.status(401).json({ error: "refresh_invalid" });
        }

        // rotate refresh
        await prisma.refreshToken.update({
            where: { id: row.id },
            data: { revoked: true },
        });

        const jti = randomId();
        const accessToken = signAccessToken(payload.sub);
        const refreshToken = signRefreshToken(payload.sub, jti);

        await prisma.refreshToken.create({
            data: {
                userId: payload.sub,
                tokenHash: sha256(refreshToken),
                expiresAt: addDays(new Date(), 7),
            },
        });

        res.json({ accessToken, refreshToken });
    } catch {
        return res.status(401).json({ error: "refresh_invalid" });
    }
});

router.get("/me", requireAuth, async (req: AuthReq, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.userId! },
        select: { id: true, email: true },
    });
    res.json({ user });
});

router.post("/logout", requireAuth, async (req: AuthReq, res) => {
    // revoga todos os refresh tokens ativos do usuário logado
    await prisma.refreshToken.updateMany({
        where: { userId: req.userId!, revoked: false },
        data: { revoked: true },
    });
    res.status(204).end();
});

export default router;
