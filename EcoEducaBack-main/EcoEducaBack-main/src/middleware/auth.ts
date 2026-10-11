import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export type AppRole = "STUDENT" | "TEACHER" | "ADMIN";

export interface AuthTokenPayload {
  id: string;
  role: AppRole;
  fullName: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload;
}

const JWT_SECRET = process.env.JWT_SECRET || "ecoeduca-ai-dev-secret";

export function signToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: (process.env.JWT_EXPIRES_IN || "8h") as jwt.SignOptions["expiresIn"],
  });
}

// Middleware que valida el JWT enviado en el header Authorization: Bearer <token>
export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token de acceso no proporcionado." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido o expirado." });
  }
}

// Middleware que restringe el acceso a uno o varios roles (ej. TEACHER, ADMIN)
export function requireRole(...roles: AppRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Acceso no autorizado para este rol." });
    }
    next();
  };
}
