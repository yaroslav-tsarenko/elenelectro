import * as jose from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-change-in-production"
);

export async function verifyTokenEdge(token: string): Promise<{ sub: string } | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return payload.sub ? { sub: payload.sub as string } : null;
  } catch {
    return null;
  }
}
