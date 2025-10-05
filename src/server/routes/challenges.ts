// src/server/routes/challenges.ts
import { Router } from "express";
import { z } from "zod";
import { requireAuth, AuthReq } from "../middleware/auth.js";
import { addActivityForUser, estimateCalories } from "./activities.js"; // ✅ use a mesma store de atividades

// ---------- Tipos ----------
type ActivityKey = "alongamento" | "caminhada" | "corrida" | "pedalada" | "yoga" | "outro";
type Intensity = "low" | "medium" | "high";

type Challenge = {
    id: string;
    sourceId?: string;     // id de origem (catálogo/evento)
    userId: string;
    title: string;
    description?: string;
    rewardXP: number;
    status: "active" | "completed";
    startedAt: string;
    completedAt?: string;

    durationDays?: number;
    expiresInDays?: number;

    metricType?: ActivityKey;
    metricDurationMin?: number;
    metricDistanceKm?: number;
    metricIntensity?: Intensity;
    metricCalories?: number;

    fromEvent?: boolean;
    eventTitle?: string;
    eventDate?: string;
    eventLocation?: string;

    instanceId?: string;   // id único da instância completada
};

type Activity = {
    id: string;
    userId: string;
    type: ActivityKey;
    dateISO: string;
    durationMin: number;
    distanceKm?: number;
    intensity: Intensity;
    mood: 1 | 2 | 3 | 4 | 5;
    environment: "open" | "closed";
    notes?: string;
    calories?: number;
};

// ---------- Estado em memória ----------
const active = new Map<string, Challenge[]>();
const completed = new Map<string, Challenge[]>();

function pushMap<T>(map: Map<string, T[]>, uid: string, item: T) {
    const prev = map.get(uid) ?? [];
    map.set(uid, [item, ...prev]);
}

function estimateDistanceKm(type?: ActivityKey, durationMin?: number): number | undefined {
    if (!type || !durationMin) return undefined;
    switch (type) {
        case "caminhada": return +(durationMin / 12).toFixed(1);
        case "corrida": return +(durationMin / 7).toFixed(1);
        case "pedalada": return +(durationMin / 3).toFixed(1);
        default: return undefined;
    }
}

function defaultIntensityFor(type?: ActivityKey): Intensity | undefined {
    switch (type) {
        case "alongamento": return "low";
        case "corrida": return "high";
        case "yoga": return "medium";
        case "caminhada":
        case "pedalada":
        case "outro":
            return "medium";
        default:
            return undefined;
    }
}

// ---------- Catálogos (mock) ----------
const AVAILABLE_CATALOG = [
    {
        id: "d01",
        title: "Caminhar 20 min por dia",
        description: "Caminhe diariamente por 20 minutos.",
        rewardXP: 10,
        durationDays: 7,
        metricType: "caminhada" as ActivityKey,
        metricDurationMin: 20,
        metricDistanceKm: +(20 / 12).toFixed(1),
        metricIntensity: "medium" as Intensity,
    },
    {
        id: "d02",
        title: "Alongar 10 min",
        description: "Faça uma sessão de alongamento curta.",
        rewardXP: 8,
        expiresInDays: 3,
        metricType: "alongamento" as ActivityKey,
        metricDurationMin: 10,
        metricIntensity: "low" as Intensity,
    },
];

const EVENTS_SOURCE = [
    {
        id: "e-sp-ibira-5k",
        title: "Corrida 5K no Ibirapuera",
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        location: "Parque do Ibirapuera",
        description: "Bora correr 5K no Ibira? Clima leve e trilha pavimentada.",
        metricType: "corrida" as ActivityKey,
        metricDistanceKm: 5,
        metricDurationMin: 35,
        metricIntensity: "medium" as Intensity,
    },
    {
        id: "e-sp-cico-ride",
        title: "Pedalada Ciclovia Paulista",
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        location: "Av. Paulista (ciclovia)",
        description: "Role de bike em ritmo social, 12–15 km.",
        metricType: "pedalada" as ActivityKey,
        metricDistanceKm: 14,
        metricDurationMin: 45,
        metricIntensity: "medium" as Intensity,
    },
];

// ---------- Validação ----------
const baseSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    rewardXP: z.number().int().nonnegative(),
    durationDays: z.number().int().positive().optional(),
    expiresInDays: z.number().int().positive().optional(),
    metricType: z.enum(["alongamento", "caminhada", "corrida", "pedalada", "yoga", "outro"]).optional(),
    metricDurationMin: z.number().int().positive().optional(),
    metricDistanceKm: z.number().positive().optional(),
    metricIntensity: z.enum(["low", "medium", "high"]).optional(),
    metricCalories: z.number().positive().optional(),
});

const eventExtra = z.object({
    date: z.string().optional(),
    location: z.string().optional(),
});

// ---------- Helpers ----------
function asList<T>(x: T[] | undefined | null): T[] {
    return Array.isArray(x) ? x : [];
}

// ---------- Router ----------
const router = Router();

/** GET /challenges?status=active|completed */
router.get("/", requireAuth, (req: AuthReq, res) => {
    try {
        const status = String(req.query.status || "active") as "active" | "completed";
        const uid = req.userId!;
        const list = status === "completed" ? (completed.get(uid) ?? []) : (active.get(uid) ?? []);
        return res.status(200).json(asList(list));
    } catch (e) {
        console.error("[GET /challenges] error:", e);
        return res.status(500).json({ error: "internal" });
    }
});

/** GET /challenges/available */
router.get("/available", requireAuth, (_req: AuthReq, res) => {
    try {
        return res.status(200).json(asList(AVAILABLE_CATALOG));
    } catch (e) {
        console.error("[GET /challenges/available] error:", e);
        return res.status(500).json({ error: "internal" });
    }
});

/** GET /challenges/events */
router.get("/events", requireAuth, (_req: AuthReq, res) => {
    try {
        return res.status(200).json(asList(EVENTS_SOURCE));
    } catch (e) {
        console.error("[GET /challenges/events] error:", e);
        return res.status(500).json({ error: "internal" });
    }
});

/** POST /challenges/available/activate */
router.post("/available/activate", requireAuth, (req: AuthReq, res) => {
    try {
        const parsed = baseSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json(parsed.error.flatten());
        const src = parsed.data;
        const uid = req.userId!;

        // Evita ativar duplicado (pelo id de origem)
        const exists = (active.get(uid) ?? []).some(c => (c.sourceId ?? c.id) === src.id);
        if (exists) return res.status(409).json({ error: "already_active" });

        const metricType = src.metricType;
        const metricDurationMin = src.metricDurationMin;
        const metricIntensity = src.metricIntensity ?? defaultIntensityFor(metricType);
        const metricDistanceKm =
            typeof src.metricDistanceKm === "number"
                ? src.metricDistanceKm
                : estimateDistanceKm(metricType, metricDurationMin);

        const item: Challenge = {
            ...src,
            metricType,
            metricDurationMin,
            metricIntensity,
            metricDistanceKm,
            id: src.id,
            sourceId: src.id,
            userId: uid,
            status: "active",
            startedAt: new Date().toISOString(),
            expiresInDays: src.durationDays ?? src.expiresInDays ?? 7,
        };

        pushMap(active, uid, item);
        return res.status(201).json(item);
    } catch (e) {
        console.error("[POST /challenges/available/activate] error:", e);
        return res.status(500).json({ error: "internal" });
    }
});

/** POST /challenges/events/join */
router.post("/events/join", requireAuth, (req: AuthReq, res) => {
    try {
        const parsed = baseSchema.merge(eventExtra).safeParse(req.body);
        if (!parsed.success) return res.status(400).json(parsed.error.flatten());
        const src = parsed.data;
        const uid = req.userId!;

        const syntheticId = `ev-${src.id}`;
        const exists = (active.get(uid) ?? []).some(c => c.id === syntheticId || c.sourceId === src.id);
        if (exists) return res.status(409).json({ error: "already_joined" });

        const metricType = src.metricType;
        const metricDurationMin = src.metricDurationMin;
        const metricIntensity = src.metricIntensity ?? defaultIntensityFor(metricType);
        const metricDistanceKm =
            typeof src.metricDistanceKm === "number"
                ? src.metricDistanceKm
                : estimateDistanceKm(metricType, metricDurationMin);

        const item: Challenge = {
            ...src,
            metricType,
            metricDurationMin,
            metricIntensity,
            metricDistanceKm,
            id: syntheticId,
            sourceId: src.id,
            userId: uid,
            status: "active",
            startedAt: new Date().toISOString(),
            expiresInDays: src.expiresInDays ?? 3,
            fromEvent: true,
            eventTitle: src.title,
            eventDate: src.date || "A definir",
            eventLocation: src.location && src.location !== "—" ? src.location : "Parque do Ibirapuera",
        };

        pushMap(active, uid, item);
        return res.status(201).json(item);
    } catch (e) {
        console.error("[POST /challenges/events/join] error:", e);
        return res.status(500).json({ error: "internal" });
    }
});

/**
 * POST /challenges/:id/complete
 * ✅ Conclui o desafio/evento e cria Activity usando a mesma store do módulo de activities
 */
router.post("/:id/complete", requireAuth, (req: AuthReq, res) => {
    try {
        const uid = req.userId!;
        const id = decodeURIComponent(String(req.params.id));

        const list = active.get(uid) ?? [];
        const idx = list.findIndex(c => c.id === id || c.sourceId === id);
        if (idx === -1) return res.status(404).json({ error: "not_found" });

        const item = list[idx];
        list.splice(idx, 1);
        active.set(uid, list);

        const completedItem: Challenge = {
            ...item,
            status: "completed",
            completedAt: new Date().toISOString(),
            instanceId: `comp-${item.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        };
        pushMap(completed, uid, completedItem);

        let createdActivity: Activity | undefined;
        if (item.metricType && item.metricDurationMin && (item.metricIntensity ?? defaultIntensityFor(item.metricType))) {
            const intensity = (item.metricIntensity ?? defaultIntensityFor(item.metricType)) as Intensity;
            const distanceKm =
                typeof item.metricDistanceKm === "number"
                    ? item.metricDistanceKm
                    : estimateDistanceKm(item.metricType, item.metricDurationMin);

            createdActivity = addActivityForUser(uid, {
                type: item.metricType,
                dateISO: new Date().toISOString(),
                durationMin: item.metricDurationMin,
                distanceKm,
                intensity,
                mood: 3,
                environment: "open",
                notes: item.fromEvent
                    ? `Conclusão do evento: ${item.eventTitle ?? item.title}`
                    : `Conclusão do desafio: ${item.title}`,
                calories:
                    typeof item.metricCalories === "number"
                        ? item.metricCalories
                        : estimateCalories(item.metricType, item.metricDurationMin, intensity),
            });
        }

        return res.status(200).json({
            activeRemovedId: item.sourceId ?? item.id,
            completedAdded: completedItem,
            createdActivity,
        });
    } catch (e) {
        console.error("[POST /challenges/:id/complete] error:", e);
        return res.status(500).json({ error: "internal" });
    }
});

export default router;
