//src/server/routes/activities.ts
import { Router } from "express";
import { z } from "zod";
import { requireAuth, AuthReq } from "../middleware/auth.js";
import fs from "fs/promises";
import path from "path";

export type Activity = {
    id: string;
    userId: string;
    type: "alongamento" | "caminhada" | "corrida" | "pedalada" | "yoga" | "outro";
    dateISO: string;
    durationMin: number;
    distanceKm?: number;
    intensity: "low" | "medium" | "high";
    mood: 1 | 2 | 3 | 4 | 5;
    environment: "open" | "closed";
    notes?: string;
    calories?: number;
};

// --------------------------------------
// Persistência em arquivo JSON (simples)
// --------------------------------------
const DATA_DIR = path.resolve(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "activities.json");

// Mapa em memória por usuário
export const mem = new Map<string, Activity[]>();

async function ensureDir() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
    } catch {
        // ignore
    }
}

async function loadFromDisk() {
    await ensureDir();
    try {
        const raw = await fs.readFile(DATA_FILE, "utf-8");
        const json: Record<string, Activity[]> = JSON.parse(raw);
        mem.clear();
        for (const [uid, list] of Object.entries(json)) {
            mem.set(uid, list);
        }
        console.log(`[activities] carregado de disco (${Object.keys(json).length} usuários)`);
    } catch {
        // sem arquivo ainda, ok
    }
}

async function saveToDisk() {
    await ensureDir();
    const obj: Record<string, Activity[]> = {};
    for (const [uid, list] of mem.entries()) obj[uid] = list;
    await fs.writeFile(DATA_FILE, JSON.stringify(obj, null, 2), "utf-8");
}

// carrega sem top-level await (mais compatível)
loadFromDisk().catch((e) => console.error("Erro ao carregar activities:", e));

// salva com debounce para reduzir IO
let saveTimer: NodeJS.Timeout | null = null;
function scheduleSave() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
        saveToDisk().catch((e) => console.error("Erro ao salvar activities:", e));
    }, 300);
}

// --------------------------------------
// validação + cálculo de calorias
// --------------------------------------
const schema = z.object({
    type: z.enum(["alongamento", "caminhada", "corrida", "pedalada", "yoga", "outro"]),
    dateISO: z.string(),
    durationMin: z.number().int().nonnegative(),
    distanceKm: z.number().nonnegative().optional(),
    intensity: z.enum(["low", "medium", "high"]),
    mood: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
    environment: z.enum(["open", "closed"]),
    notes: z.string().max(500).optional(),
    calories: z.number().nonnegative().optional(),
});

export function estimateCalories(
    type: Activity["type"],
    durationMin: number,
    intensity: Activity["intensity"],
    kg = 70
) {
    const METS: Record<Activity["type"], number> = {
        alongamento: 2.3,
        caminhada: 3.5,
        corrida: 9,
        pedalada: 7,
        yoga: 3,
        outro: 3.5,
    };
    const MULT: Record<Activity["intensity"], number> = { low: 0.85, medium: 1, high: 1.15 };
    const met = (METS[type] ?? 3.5) * (MULT[intensity] ?? 1);
    return Math.round(((met * 3.5 * kg) / 200) * durationMin);
}

// --------------------------------------
// Leitura pública (para outros módulos)
// --------------------------------------
export function getUserActivities(userId: string): Activity[] {
    return (mem.get(userId) ?? []).slice();
}

/**
 * ✅ Novo: addActivityForUser
 * Permite que outros módulos (ex.: challenges) criem uma atividade
 * usando a MESMA fonte de dados das métricas.
 */
export function addActivityForUser(
    userId: string,
    data: Omit<Activity, "id" | "userId" | "calories"> & { id?: string; calories?: number }
): Activity {
    const created: Activity = {
        ...data,
        id: data.id ?? `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        userId,
        calories:
            typeof data.calories === "number"
                ? data.calories
                : estimateCalories(data.type, data.durationMin, data.intensity),
    };
    const prev = mem.get(userId) ?? [];
    mem.set(userId, [created, ...prev]);
    scheduleSave();
    return created;
}

// --------------------------------------
// rotas
// --------------------------------------
const router = Router();

// Lista atividades do usuário (ordenadas por data desc)
router.get("/", requireAuth, (req: AuthReq, res) => {
    const ordered = getUserActivities(req.userId!).sort(
        (a, b) => +new Date(b.dateISO) - +new Date(a.dateISO)
    );
    res.json(ordered);
});

// Cria atividade
router.post("/", requireAuth, async (req: AuthReq, res) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error.flatten());
    const data = parsed.data;

    const created = addActivityForUser(req.userId!, data);
    res.status(201).json(created);
});

// Exporta todas as atividades do usuário
router.get("/export", requireAuth, (req: AuthReq, res) => {
    res.json(getUserActivities(req.userId!));
});

export default router;

