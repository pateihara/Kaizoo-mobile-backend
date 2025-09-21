import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import authRoutes from "./routes/auth"; // <-- add
import profileRoutes from "./routes/profile";

const app = express();
app.use(helmet());
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN === "*" ? true : process.env.CORS_ORIGIN }));

app.get("/health", (_req, res) => {
    res.json({ ok: true, message: "API está rodando 🚀" });
});

app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);

const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, () => {
    console.log(`✅ Auth API rodando em http://localhost:${PORT}`);
});
