import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";

export function verifyToken(token: string): { sub: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { sub: string };
  } catch {
    return null;
  }
}

export function createToken(userId: string, maxAge: number) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: maxAge });
}
