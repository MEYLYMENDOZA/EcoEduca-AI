import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore, Role } from "../store/authStore";

interface Props {
  children: ReactNode;
  allowedRoles?: Role[];
}

// Protege rutas que requieren sesión activa (y opcionalmente uno o varios roles)
export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { token, user } = useAuthStore();

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
