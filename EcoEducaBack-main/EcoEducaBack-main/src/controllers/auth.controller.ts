import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { signToken } from "../middleware/auth";

// Autenticación universal: DNI (8 dígitos) + contraseña, válida para
// STUDENT, TEACHER y ADMIN por igual (HU-01 del SRS v2).
const loginSchema = z.object({
  dni: z.string().regex(/^\d{8}$/, "El DNI debe tener exactamente 8 dígitos."),
  password: z.string().min(1),
});

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "DNI o contraseña incorrectos." });
  }
  const { dni, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { dni } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "DNI o contraseña incorrectos." });
  }

  const token = signToken({ id: user.id, role: user.role, fullName: user.fullName });

  return res.json({
    token,
    user: {
      id: user.id,
      dni: user.dni,
      fullName: user.fullName,
      role: user.role,
      grade: user.grade,
      accessProfile: user.accessProfile,
    },
  });
}
