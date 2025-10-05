// src/index.ts
import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import authRoutes from "./server/routes/auth.js";
import profileRoutes from "./server/routes/profile.js";
import challengesRoutes from "./server/routes/challenges.js";
import activitiesRoutes from "./server/routes/activities.js"; // ← NOVO
import metricsRoutes from "./server/routes/metrics.js";       // ← NOVO

const app = express();

app.use(helmet());
app.use(express.json());

// CORS (antes das rotas)
app.use(
    cors({
        origin: process.env.CORS_ORIGIN === "*" ? true : process.env.CORS_ORIGIN,
        allowedHeaders: ["Content-Type", "Authorization"],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    })
);

// Log simples (ajuda a ver 404)
app.use((req, _res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.get("/health", (_req, res) => {
    res.json({ ok: true, message: "API está rodando 🚀" });
});

// Rotas
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/challenges", challengesRoutes);
app.use("/activities", activitiesRoutes); // ← NOVO
app.use("/metrics", metricsRoutes);       // ← NOVO

const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => {
    console.log(`✅ API rodando em http://localhost:${PORT}`);
});
