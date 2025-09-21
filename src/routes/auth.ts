// src/routes/auth.ts
import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import { prisma } from "../db";
import { requireAuth } from "../middleware/requireAuth";
import { hashToken, newRefreshTokenRaw, signAccessToken } from "../utils/tokens";

const router = Router();

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
    name: z.string().min(2).max(60).optional(),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

function ttlToMs(span: string) {
    // aceita '15m', '7d', '1h'...
    const m = span.match(/^(\d+)([smhd])$/);
    if (!m) return 0;
    const n = Number(m[1]);
    const map: any = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    return n * map[m[2]];
}

// --------- REGISTER
router.post("/register", async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });

    const { email, password, name } = parsed.data;

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ error: "E-mail já cadastrado" });

    const hash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
        data: { email, password: hash, name },
        select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            profileReady: true,
            kaizoo: true,
        },
    });

    return res.status(201).json({ user });
});

// --------- LOGIN
router.post("/login", async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
        where: { email },
        select: {
            id: true,
            email: true,
            name: true,
            password: true, // necessário para comparar
            profileReady: true,
            kaizoo: true,
        },
    });
    if (!user) return res.status(401).json({ error: "Credenciais inválidas" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Credenciais inválidas" });

    const accessToken = signAccessToken({ id: user.id, email: user.email });
    const refreshRaw = newRefreshTokenRaw();
    const expiresAt = new Date(
        Date.now() + ttlToMs(process.env.REFRESH_TOKEN_TTL ?? "7d")
    );

    await prisma.refreshToken.create({
        data: {
            userId: user.id,
            tokenHash: hashToken(refreshRaw),
            expiresAt,
        },
    });

    res.json({
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            profileReady: user.profileReady,
            kaizoo: user.kaizoo,
        },
        tokens: { accessToken, refreshToken: refreshRaw },
    });
});

// --------- REFRESH
router.post("/refresh", async (req, res) => {
    const refreshToken = String(req.body?.refreshToken ?? "");
    if (!refreshToken)
        return res.status(400).json({ error: "Missing refreshToken" });

    const saved = await prisma.refreshToken.findFirst({
        where: { tokenHash: hashToken(refreshToken), revoked: false },
    });
    if (!saved) return res.status(401).json({ error: "Invalid refresh token" });
    if (saved.expiresAt < new Date()) {
        await prisma.refreshToken.update({
            where: { id: saved.id },
            data: { revoked: true },
        });
        return res.status(401).json({ error: "Refresh token expired" });
    }

    const user = await prisma.user.findUnique({ where: { id: saved.userId } });
    if (!user) return res.status(401).json({ error: "User not found" });

    // rotação de refresh: revoga o antigo e emite outro
    await prisma.refreshToken.update({
        where: { id: saved.id },
        data: { revoked: true },
    });

    const accessToken = signAccessToken({ id: user.id, email: user.email });
    const newRefresh = newRefreshTokenRaw();
    const expiresAt = new Date(
        Date.now() + ttlToMs(process.env.REFRESH_TOKEN_TTL ?? "7d")
    );

    await prisma.refreshToken.create({
        data: {
            userId: user.id,
            tokenHash: hashToken(newRefresh),
            expiresAt,
        },
    });

    res.json({ accessToken, refreshToken: newRefresh });
});

// --------- LOGOUT (revoga o refresh recebido)
router.post("/logout", async (req, res) => {
    const refreshToken = String(req.body?.refreshToken ?? "");
    if (!refreshToken)
        return res.status(400).json({ error: "Missing refreshToken" });

    await prisma.refreshToken.updateMany({
        where: { tokenHash: hashToken(refreshToken), revoked: false },
        data: { revoked: true },
    });

    res.json({ ok: true });
});

// --------- ROTA PROTEGIDA (exemplo)
router.get("/me", requireAuth, async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.userId! },
        select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            profileReady: true,
            kaizoo: true,
        },
    });
    res.json({ user });
});

export default router;
