// src/server/utils/jwt.ts
import jwt from "jsonwebtoken";
import {
    ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET,
    ACCESS_EXPIRES_IN,
    REFRESH_EXPIRES_IN,
} from "../env.js";

export function signAccessToken(userId: string) {
    return jwt.sign({ sub: userId }, ACCESS_TOKEN_SECRET, {
        algorithm: "HS256",
        expiresIn: ACCESS_EXPIRES_IN,
    });
}

export function signRefreshToken(userId: string, jti: string) {
    return jwt.sign({ sub: userId, jti }, REFRESH_TOKEN_SECRET, {
        algorithm: "HS256",
        expiresIn: REFRESH_EXPIRES_IN,
    });
}

export function verifyRefresh(token: string) {
    const payload = jwt.verify(token, REFRESH_TOKEN_SECRET, {
        algorithms: ["HS256"],
    }) as jwt.JwtPayload & { sub?: string; jti?: string };

    if (!payload?.sub) throw new Error("invalid_refresh_payload");
    return { sub: String(payload.sub), jti: payload.jti };
}

export function verifyAccess(token: string) {
    const payload = jwt.verify(token, ACCESS_TOKEN_SECRET, {
        algorithms: ["HS256"],
    }) as jwt.JwtPayload & { sub?: string };

    if (!payload?.sub) throw new Error("invalid_access_payload");
    return { sub: String(payload.sub) };
}
