import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import crypto from "crypto";

const ACCESS_SECRET: Secret = (process.env.JWT_ACCESS_SECRET ?? "") as Secret;
// string | number (ex.: "15m")
const ACCESS_TTL: SignOptions["expiresIn"] =
    (process.env.ACCESS_TOKEN_TTL as SignOptions["expiresIn"]) ?? "15m";

export function signAccessToken(user: { id: string; email: string }) {
    const payload = { sub: user.id, email: user.email };
    const opts: SignOptions = { expiresIn: ACCESS_TTL };
    return jwt.sign(payload, ACCESS_SECRET, opts);
}

// refresh opaco (random); guardamos SÓ o hash no banco
export function newRefreshTokenRaw() {
    return crypto.randomBytes(48).toString("hex");
}

export function hashToken(t: string) {
    return crypto.createHash("sha256").update(t).digest("hex");
}
