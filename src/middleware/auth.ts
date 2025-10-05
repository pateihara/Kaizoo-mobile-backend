//src/server/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;

export interface AuthReq extends Request {
    userId?: string;
}

export function requireAuth(req: AuthReq, res: Response, next: NextFunction) {
    const hdr = req.headers.authorization || "";
    const [, token] = hdr.split(" "); // "Bearer <token>"
    if (!token) return res.status(401).json({ error: "missing_token" });

    try {
        const payload = jwt.verify(token, ACCESS_TOKEN_SECRET, { algorithms: ["HS256"] }) as jwt.JwtPayload & { sub?: string };
        if (!payload?.sub) return res.status(401).json({ error: "invalid_token" });

        req.userId = String(payload.sub);
        next();
    } catch (err) {
        return res.status(401).json({ error: "invalid_token" });
    }
}
