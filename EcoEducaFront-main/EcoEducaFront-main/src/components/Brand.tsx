interface Props {
  variant?: "light" | "dark";
  size?: "sm" | "lg";
}

// Marca institucional reutilizable en las pantallas de acceso y el dashboard.
export default function Brand({ variant = "light", size = "lg" }: Props) {
  const textColor = variant === "light" ? "text-white" : "text-eco-green";
  const subColor = variant === "light" ? "text-white/70" : "text-gray-500";
  const markBg = variant === "light" ? "bg-white/10" : "bg-eco-green";
  const markFg = variant === "light" ? "text-white" : "text-white";
  const dimension = size === "lg" ? "h-14 w-14" : "h-10 w-10";

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <span
        className={`flex items-center justify-center rounded-xl ${dimension} ${markBg} ${markFg}`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={size === "lg" ? "h-7 w-7" : "h-5 w-5"}
        >
          <path
            d="M12 3 2 8l10 5 10-5-10-5Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M6 10.5V16c0 1.1 2.7 3 6 3s6-1.9 6-3v-5.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <h1
        className={`font-display font-bold tracking-tight ${textColor} ${
          size === "lg" ? "text-2xl" : "text-lg"
        }`}
      >
        EcoEduca<span className="text-eco-accent">·</span>AI
      </h1>
      <p className={`text-sm ${subColor}`}>Plataforma Educativa Inclusiva</p>
    </div>
  );
}
