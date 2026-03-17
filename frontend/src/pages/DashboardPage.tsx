import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, Droplets, Flame, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getWorkouts, getWaterToday } from '../services/api';
import { Workout, WaterIntake } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './DashboardPage.css';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit?: string;
  color: string;
  link: string;
}

function StatCard({ icon, label, value, unit, color, link }: StatCardProps) {
  return (
    <Link to={link} className="stat-card" style={{ '--card-accent': color } as React.CSSProperties}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-info">
        <span className="stat-label">{label}</span>
        <div className="stat-value">{value}<span className="stat-unit">{unit}</span></div>
      </div>
    </Link>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [waterEntries, setWaterEntries] = useState<WaterIntake[]>([]);
  const [waterTotal, setWaterTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getWorkouts(5, 0),
      getWaterToday(),
    ]).then(([workoutRes, waterRes]) => {
      setWorkouts(workoutRes.data.workouts);
      setWaterEntries(waterRes.data.entries);
      setWaterTotal(waterRes.data.totalMl);
    }).finally(() => setIsLoading(false));
  }, []);

  const totalCalories = workouts.reduce((sum, w) => sum + (w.calories ?? 0), 0);
  const totalMinutes = workouts.reduce((sum, w) => sum + w.duration, 0);

  const chartData = workouts.slice(0, 7).reverse().map((w) => ({
    name: w.title.slice(0, 10),
    minutos: w.duration,
  }));

  const waterGoal = 2500;
  const waterPct = Math.min((waterTotal / waterGoal) * 100, 100);

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}><div className="spinner" /></div>;
  }

  return (
    <div className="dashboard animate-fade-up">
      <div className="dashboard-header">
        <div>
          <h1>¡Hola, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="header-sub">Aquí tienes tu resumen de hoy</p>
        </div>
        {user?.image && <img src={user.image} alt={user.name} className="header-avatar" />}
      </div>

      <div className="stats-grid">
        <StatCard
          icon={<Dumbbell size={24} />}
          label="Entrenamientos"
          value={workouts.length}
          unit=" sesiones"
          color="#6c63ff"
          link="/workouts"
        />
        <StatCard
          icon={<Flame size={24} />}
          label="Calorías quemadas"
          value={totalCalories}
          unit=" kcal"
          color="#ff6b6b"
          link="/workouts"
        />
        <StatCard
          icon={<TrendingUp size={24} />}
          label="Tiempo activo"
          value={totalMinutes}
          unit=" min"
          color="#ffd166"
          link="/workouts"
        />
        <StatCard
          icon={<Droplets size={24} />}
          label="Agua hoy"
          value={waterTotal}
          unit=" ml"
          color="#00d4aa"
          link="/water"
        />
      </div>

      <div className="dashboard-bottom">
        <div className="card chart-card">
          <h3>Últimas sesiones</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={11} />
                <YAxis stroke="var(--color-text-muted)" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                  labelStyle={{ color: 'var(--color-text)' }}
                />
                <Bar dataKey="minutos" fill="url(#gradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6c63ff" />
                    <stop offset="100%" stopColor="#00d4aa" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="empty-state">No hay entrenamientos todavía. <Link to="/workouts">¡Añade uno!</Link></p>
          )}
        </div>

        <div className="card water-card">
          <h3>Hidratación de hoy</h3>
          <div className="water-display">
            <span className="water-big">{waterTotal}<span className="water-unit">ml</span></span>
            <span className="water-goal">/ {waterGoal} ml objetivo</span>
          </div>
          <div className="water-bar">
            <div className="water-fill" style={{ width: `${waterPct}%` }} />
          </div>
          <p className="water-pct">{waterPct.toFixed(0)}% del objetivo diario</p>
          <div className="water-entries">
            {waterEntries.slice(0, 4).map((e) => (
              <div key={e.id} className="water-entry">
                <Droplets size={14} color="#00d4aa" />
                <span>{e.amount} ml</span>
                <span className="entry-time">{new Date(e.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
          </div>
          <Link to="/water" className="btn btn-secondary" style={{ marginTop: '1rem', justifyContent: 'center', display: 'flex' }}>
            Registrar agua
          </Link>
        </div>
      </div>
    </div>
  );
}
