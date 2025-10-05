//src/server/utils/hash.ts
import bcrypt from "bcrypt";
import crypto from "crypto";

export const hashPassword = async (plain: string) => bcrypt.hash(plain, 10);
export const comparePassword = async (plain: string, hash: string) => bcrypt.compare(plain, hash);
export const sha256 = (s: string) => crypto.createHash("sha256").update(s).digest("hex");
export const randomId = (bytes = 16) => crypto.randomBytes(bytes).toString("hex");
