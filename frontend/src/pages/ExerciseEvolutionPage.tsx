import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AIExercise, CompletedWorkoutSession, ActiveWorkoutLog } from '../types';
import './ExerciseEvolutionPage.css';

function getHistory(): CompletedWorkoutSession[] {
  try { return JSON.parse(localStorage.getItem('workout-history') || '[]'); }
  catch { return []; }
}

interface SetPoint {
  date: string;
  maxWeight: number;
  totalReps: number;
  sets: number;
}

export function ExerciseEvolutionPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const exercise: AIExercise | undefined = (location.state as { exercise?: AIExercise })?.exercise;

  const history = useMemo(getHistory, []);

  const evolutionData = useMemo((): SetPoint[] => {
    if (!exercise) return [];
    const normTarget = exercise.nombre.trim().toLowerCase();
    const points: SetPoint[] = [];
    const sorted = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    sorted.forEach((session) => {
      const ex = session.ejercicios?.find((e) => (e.nombre || '').trim().toLowerCase() === normTarget);
      if (!ex) return;
      const completed = (ex.logs || []).filter((l: ActiveWorkoutLog) => l.completed && l.weight && l.reps);
      if (completed.length === 0) return;
      const maxWeight = Math.max(...completed.map((l: ActiveWorkoutLog) => parseFloat(l.weight) || 0));
      const totalReps = completed.reduce((acc: number, l: ActiveWorkoutLog) => acc + (parseInt(l.reps) || 0), 0);
      points.push({ date: session.date, maxWeight, totalReps, sets: completed.length });
    });
    return points;
  }, [exercise, history]);

  const maxW = evolutionData.length > 0 ? Math.max(...evolutionData.map((p) => p.maxWeight)) : 0;
  const pr = evolutionData.length > 0 ? evolutionData.reduce((best, p) => p.maxWeight > best.maxWeight ? p : best, evolutionData[0]) : null;

  if (!exercise) {
    return (
      <div className="evolution-page animate-fade-up">
        <div className="card evolution-empty">
          <div>📈</div>
          <h3>Ningún ejercicio seleccionado</h3>
          <p>Selecciona un ejercicio desde el Directorio</p>
          <button className="btn btn-primary" onClick={() => navigate('/directory')}>Ir al Directorio</button>
        </div>
      </div>
    );
  }

  return (
    <div className="evolution-page animate-fade-up">
      <div className="page-header">
        <div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>← Volver</button>
          <h2>{exercise.nombre}</h2>
          <p className="header-sub">{exercise.grupoMuscular} · {exercise.complejidad}</p>
        </div>
      </div>

      {/* PR Banner */}
      {pr && (
        <div className="card evolution-pr">
          <div className="evolution-pr__item">
            <span>🏆 Récord Personal</span>
            <strong>{pr.maxWeight} kg</strong>
          </div>
          <div className="evolution-pr__item">
            <span>📅 Fecha del PR</span>
            <strong>{new Date(pr.date).toLocaleDateString('es-ES')}</strong>
          </div>
          <div className="evolution-pr__item">
            <span>📊 Sesiones registradas</span>
            <strong>{evolutionData.length}</strong>
          </div>
        </div>
      )}

      {evolutionData.length === 0 ? (
        <div className="card evolution-empty">
          <div>📈</div>
          <h3>Sin datos de evolución</h3>
          <p>Completa sesiones de entrenamiento con "{exercise.nombre}" para ver tu progreso aquí</p>
        </div>
      ) : (
        <>
          {/* Chart */}
          <div className="card evolution-chart-card">
            <h4>Progresión de peso máximo por sesión</h4>
            <div className="evolution-chart">
              {evolutionData.map((point, i) => {
                const heightPct = maxW > 0 ? (point.maxWeight / maxW) * 100 : 0;
                return (
                  <div key={i} className="evolution-bar-col">
                    <div className="evolution-bar-label">{point.maxWeight > 0 ? `${point.maxWeight}kg` : '—'}</div>
                    <div className="evolution-bar-wrap">
                      <div
                        className="evolution-bar"
                        style={{ height: `${heightPct}%` }}
                        title={`${new Date(point.date).toLocaleDateString('es-ES')}: ${point.maxWeight}kg`}
                      />
                    </div>
                    <div className="evolution-bar-date">
                      {new Date(point.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sessions detail */}
          <div className="evolution-sessions">
            <h4>Detalle de sesiones</h4>
            {[...evolutionData].reverse().map((point, i) => (
              <div key={i} className="evolution-session card">
                <span className="evolution-session__date">
                  {new Date(point.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                </span>
                <div className="evolution-session__stats">
                  <span>💪 {point.maxWeight} kg</span>
                  <span>🔢 {point.sets} series</span>
                  <span>✅ {point.totalReps} reps totales</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
