import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare global {
    namespace Express {
        interface Request {
            userId?: string;
            userEmail?: string;
        }
    }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Missing token" });
    }
    const token = auth.slice(7);
    try {
        const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as {
            sub: string;
            email: string;
        };
        req.userId = payload.sub;
        req.userEmail = payload.email;
        next();
    } catch {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}
