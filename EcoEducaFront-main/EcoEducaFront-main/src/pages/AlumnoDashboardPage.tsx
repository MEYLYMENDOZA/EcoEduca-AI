import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Globe2,
  BookOpen,
  Calculator,
  FlaskConical,
  GraduationCap,
  Flame,
  Trophy,
  Target,
  Footprints,
  BookOpenCheck,
  Compass,
  Star,
  Lock,
  LucideIcon,
} from "lucide-react";
import apiClient from "../api/client";
import { useAuthStore } from "../store/authStore";
import AppHeader from "../components/AppHeader";
import GamifiedHero from "../components/GamifiedHero";
import BadgeMedal from "../components/BadgeMedal";
import CourseCard from "../components/CourseCard";

interface Course {
  id: string;
  title: string;
  grade: string;
}

interface Badge {
  id: string;
  label: string;
  icon: string;
  description: string;
  achieved: boolean;
}

interface Stats {
  xp: number;
  streak: number;
  totalAnswered: number;
  totalCorrect: number;
  accuracyPct: number | null;
  topicsExplored: number;
  badges: Badge[];
}

const XP_PER_LEVEL = 100;

export default function AlumnoDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    apiClient.get("/courses").then(({ data }) => setCourses(data.courses));
    apiClient.get("/profile/stats").then(({ data }) => setStats(data));
  }, []);

  const level = stats ? Math.floor(stats.xp / XP_PER_LEVEL) + 1 : 1;
  const xpIntoLevel = stats ? stats.xp % XP_PER_LEVEL : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader subtitle={`${user?.fullName} · ${user?.grade || "Estudiante"}`} />

      <main className="mx-auto max-w-5xl space-y-10 px-6 py-8">
        {/* Gamified Hero */}
        <GamifiedHero
          fullName={user?.fullName || "Estudiante"}
          level={level}
          xp={stats?.xp ?? 0}
          xpIntoLevel={xpIntoLevel}
          xpPerLevel={XP_PER_LEVEL}
          streak={stats?.streak ?? 0}
          accuracyPct={stats?.accuracyPct ?? null}
        />

        {/* Insignias con diseño de medallas */}
        <section>
          <h2 className="mb-6 text-lg font-bold text-eco-green">Mis insignias</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {stats?.badges.map((badge, i) => (
              <BadgeMedal key={badge.id} badge={badge} index={i} />
            ))}
          </div>
        </section>

        {/* Cursos con tarjetas temáticas */}
        <section>
          <h2 className="mb-6 text-lg font-bold text-eco-green">Mis cursos</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {courses.map((course, i) => (
              <CourseCard key={course.id} course={course} index={i} />
            ))}
            {courses.length === 0 && (
              <p className="col-span-full text-center text-gray-400">
                Aún no estás matriculado en ningún curso.
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}