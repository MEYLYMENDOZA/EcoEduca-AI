import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/client";
import { useAuthStore } from "../store/authStore";
import Brand from "../components/Brand";

// Autenticación universal (HU-01): un único formulario de DNI + contraseña
// válido para STUDENT, TEACHER y ADMIN.
export default function LoginPage() {
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await apiClient.post("/auth/login", { dni, password });
      login(data.token, data.user);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.error || "DNI o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-slate-100 px-4 py-12">
      <Brand variant="dark" />

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-card"
      >
        <h1 className="mb-1 text-xl font-bold text-eco-green">Ingresar a EcoEduca·AI</h1>
        <p className="mb-6 text-sm text-gray-500">
          Ingresa con tu DNI y contraseña. Válido para alumnos y docentes.
        </p>

        <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="dni">
          DNI
        </label>
        <input
          id="dni"
          className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-eco-green focus:outline-none"
          value={dni}
          onChange={(e) => setDni(e.target.value)}
          inputMode="numeric"
          maxLength={8}
          autoComplete="username"
          required
        />

        <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="password">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-eco-green focus:outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        {error && (
          <p className="mb-4 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-eco-green px-4 py-3 font-semibold text-white transition hover:bg-eco-lightgreen disabled:opacity-60"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>

        <p className="mt-4 text-center text-xs text-gray-400">
          ¿Olvidaste tu contraseña? Solicita el restablecimiento a tu docente tutor.
        </p>
      </form>
    </div>
  );
}
