// src/server/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import { verifyAccess } from "../utils/jwt.js";

export interface AuthReq extends Request {
    userId?: string;
}

export function requireAuth(req: AuthReq, res: Response, next: NextFunction) {
    const hdr = req.headers.authorization || "";
    const [, token] = hdr.split(" "); // "Bearer <token>"
    if (!token) return res.status(401).json({ error: "missing_token" });

    try {
        const { sub } = verifyAccess(token);
        req.userId = sub;
        next();
    } catch {
        return res.status(401).json({ error: "invalid_token" });
    }
}
