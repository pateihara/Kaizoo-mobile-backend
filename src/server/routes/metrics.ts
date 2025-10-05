//src/server/routes/metrics.ts
import { Router } from "express";
import { z } from "zod";
import { requireAuth, AuthReq } from "../middleware/auth.js";
import { getUserActivities } from "./activities.js";

const router = Router();

function startOfWeek(d = new Date()) {
    const date = new Date(d);
    const day = date.getDay() || 7; // 1..7 (domingo=7)
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (day - 1)); // segunda-feira
    return date;
}

router.get("/weekly", requireAuth, (req: AuthReq, res) => {
    const qs = z.object({ weekStart: z.string().optional() }).safeParse(req.query);

    const weekStart = qs.success && qs.data.weekStart
        ? new Date(qs.data.weekStart)
        : startOfWeek(new Date());

    if (Number.isNaN(+weekStart)) {
        return res.status(400).json({ error: "Parâmetro 'weekStart' inválido" });
    }

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const list = getUserActivities(req.userId!);

    const inWeek = list.filter((a) => {
        const t = +new Date(a.dateISO);
        return t >= +weekStart && t < +weekEnd;
    });

    const activeDays = new Set(inWeek.map((a) => new Date(a.dateISO).toDateString())).size;
    const activeMinutes = inWeek.reduce((s, a) => s + (a.durationMin ?? 0), 0);
    const distanceKm = inWeek.reduce((s, a) => s + (a.distanceKm ?? 0), 0);
    const calories = inWeek.reduce((s, a) => s + (a.calories ?? 0), 0);

    res.json({ activeDays, activeMinutes, distanceKm, calories });
});

export default router;
