//src/server/env.ts
import "dotenv/config";
import type { SignOptions } from "jsonwebtoken";

function need(nameA: string, nameB?: string) {
    const v = process.env[nameA] ?? (nameB ? process.env[nameB] : undefined);
    if (!v) {
        throw new Error(`Faltou variável no .env: ${nameA}` + (nameB ? ` (ou ${nameB})` : ""));
    }
    return v;
}

export const NODE_ENV = process.env.NODE_ENV ?? "development";

// aceita JWT_* e/ou ACCESS_/REFRESH_TOKEN_SECRET
export const ACCESS_TOKEN_SECRET =
    process.env.ACCESS_TOKEN_SECRET ?? need("JWT_ACCESS_SECRET");
export const REFRESH_TOKEN_SECRET =
    process.env.REFRESH_TOKEN_SECRET ?? need("JWT_REFRESH_SECRET");

const accessRaw = process.env.JWT_ACCESS_EXPIRES ?? "15m";
const refreshRaw = process.env.JWT_REFRESH_EXPIRES ?? "7d";

export const ACCESS_EXPIRES_IN = accessRaw as SignOptions["expiresIn"];
export const REFRESH_EXPIRES_IN = refreshRaw as SignOptions["expiresIn"];

export const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "*";
export const PORT = Number(process.env.PORT ?? 4000);
export const DATABASE_URL = process.env.DATABASE_URL ?? "";
