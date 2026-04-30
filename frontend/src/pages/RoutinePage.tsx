import { useState, useCallback, useMemo } from 'react';
import { generateRoutine } from '../services/api';
import { AIRoutine, RoutineDay, RoutineExercise, CompletedWorkoutSession } from '../types';
import { VideoModal } from '../components/VideoModal';
import { useNavigate } from 'react-router-dom';
import './RoutinePage.css';

const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const DURATIONS = [30, 45, 60, 75, 90];
const COMPLEXITY_COLORS: Record<string, string> = {
  principiante: '#10b981',
  intermedio: '#f59e0b',
  avanzado: '#ef4444',
};

function getWorkoutHistory(): CompletedWorkoutSession[] {
  try {
    return JSON.parse(localStorage.getItem('workout-history') || '[]');
  } catch { return []; }
}

function normalizeExName(name: string) {
  return (name || '').trim().toLowerCase();
}

export function RoutinePage() {
  const navigate = useNavigate();
  const [routine, setRoutine] = useState<AIRoutine | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState(0);
  const [videoData, setVideoData] = useState<{ query: string; videoId?: string } | null>(null);

  // Form state
  const [selectedDays, setSelectedDays] = useState<string[]>(['Lunes', 'Miércoles', 'Viernes']);
  const [duration, setDuration] = useState(60);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [showForm, setShowForm] = useState(true);

  const workoutHistory = getWorkoutHistory();

  const exerciseStats = useMemo(() => {
    const stats: Record<string, { maxWeight: number; lastWeight: number }> = {};
    const sorted = [...workoutHistory].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    sorted.forEach((session) => {
      if (!session?.ejercicios) return;
      session.ejercicios.forEach((ex) => {
        if (!ex?.nombre) return;
        const key = normalizeExName(ex.nombre);
        if (!stats[key]) stats[key] = { maxWeight: 0, lastWeight: 0 };
        if (ex.logs) {
          let sessionMax = 0;
          let hasCompleted = false;
          ex.logs.forEach((log) => {
            if (log.completed && log.weight && log.reps) {
              const w = parseFloat(log.weight);
              if (w > sessionMax) sessionMax = w;
              hasCompleted = true;
            }
          });
          if (hasCompleted) {
            if (sessionMax > stats[key].maxWeight) stats[key].maxWeight = sessionMax;
            stats[key].lastWeight = sessionMax;
          }
        }
      });
    });
    return stats;
  }, []);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleGenerate = useCallback(async () => {
    if (selectedDays.length === 0) {
      setError('Selecciona al menos un día de entrenamiento.');
      return;
    }
    if (!weight || !height) {
      setError('Introduce tu peso y altura para personalizar la rutina.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await generateRoutine({
        days: selectedDays,
        duration,
        weight: Number(weight),
        height: Number(height),
      });
      setRoutine(res.data.routine);
      setActiveDay(0);
      setShowForm(false);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Error al generar la rutina. Inténtalo de nuevo.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDays, duration, weight, height]);

  const handleStartWorkout = (day: RoutineDay) => {
    navigate('/active-workout', { state: { workoutDay: day } });
  };

  const currentDay = routine?.dias[activeDay];

  return (
    <div className="routine-page animate-fade-up">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>Rutina Semanal IA</h2>
          <p className="header-sub">Genera tu plan personalizado con Inteligencia Artificial</p>
        </div>
        {routine && (
          <button className="btn btn-secondary" onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Ver Rutina' : '⚙️ Ajustar parámetros'}
          </button>
        )}
      </div>

      {/* Generator Form */}
      {showForm && (
        <div className="card routine-form animate-fade-up">
          <h3>Configurar rutina</h3>
          <div className="routine-form__section">
            <label>Días de entrenamiento</label>
            <div className="routine-form__days">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day}
                  className={`day-chip ${selectedDays.includes(day) ? 'day-chip--active' : ''}`}
                  onClick={() => toggleDay(day)}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
          <div className="routine-form__grid">
            <div className="input-group">
              <label>Duración por sesión</label>
              <select value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
                {DURATIONS.map((d) => (
                  <option key={d} value={d}>{d} minutos</option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label>Peso (kg)</label>
              <input
                type="number" min="30" max="300"
                placeholder="ej: 75"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Altura (cm)</label>
              <input
                type="number" min="100" max="250"
                placeholder="ej: 175"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </div>
          </div>
          {error && (
            <div className="routine-error">
              <span>⚠️</span> {error}
              <button onClick={() => setError(null)}>✕</button>
            </div>
          )}
          <button
            className="btn btn-primary routine-form__submit"
            onClick={handleGenerate}
            disabled={isLoading || selectedDays.length === 0}
          >
            {isLoading ? (
              <><span className="spinner-sm" /> Generando rutina con IA...</>
            ) : (
              <> 🤖 Generar rutina con IA</>
            )}
          </button>
        </div>
      )}

      {/* Routine Viewer */}
      {routine && !showForm && (
        <div className="routine-view animate-fade-up">
          {/* Summary */}
          <div className="card routine-summary">
            <p className="routine-summary__text">{routine.resumen}</p>
            <div className="routine-summary__pills">
              <span className="pill">🔥 {routine.caloriasSemanalesEstimadas} kcal/sem</span>
              <span className="pill">💪 {routine.dias.length} días de entreno</span>
              <span className="pill">😴 {routine.diasDescanso?.length ?? 0} días de descanso</span>
            </div>
          </div>

          {/* Day tabs */}
          <div className="routine-tabs">
            {routine.dias.map((dia, idx) => (
              <button
                key={idx}
                className={`routine-tab ${activeDay === idx ? 'routine-tab--active' : ''}`}
                onClick={() => setActiveDay(idx)}
              >
                <span className="routine-tab__day">{dia.dia}</span>
                <span className="routine-tab__focus">{dia.enfoque}</span>
              </button>
            ))}
          </div>

          {/* Day content */}
          {currentDay && (
            <div className="routine-day card animate-fade-up" key={activeDay}>
              <div className="routine-day__header">
                <div>
                  <h3>{currentDay.dia} — {currentDay.enfoque}</h3>
                  <div className="routine-day__meta">
                    <span>⏱️ {currentDay.duracionTotal} min</span>
                    <span>🔥 {currentDay.caloriasDelDia} kcal</span>
                  </div>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => handleStartWorkout(currentDay)}
                >
                  🔥 Empezar
                </button>
              </div>

              {/* Warm-up */}
              <div className="routine-phase routine-phase--warmup">
                <span>🔆</span>
                <div>
                  <strong>Calentamiento</strong>
                  <p>{currentDay.calentamiento}</p>
                </div>
              </div>

              {/* Exercises */}
              <div className="routine-exercises">
                {currentDay.ejercicios.map((ex: RoutineExercise, i: number) => {
                  const stats = exerciseStats[normalizeExName(ex.nombre)] ?? { maxWeight: 0, lastWeight: 0 };
                  return (
                    <div className="routine-exercise" key={i} style={{ animationDelay: `${i * 0.06}s` }}>
                      <div className="routine-exercise__num">{i + 1}</div>
                      <div className="routine-exercise__body">
                        <div className="routine-exercise__top">
                          <h4>{ex.nombre}</h4>
                          <span
                            className="complexity-badge"
                            style={{ background: COMPLEXITY_COLORS[ex.complejidad] ?? '#f59e0b' }}
                          >
                            {ex.complejidad}
                          </span>
                        </div>
                        <div className="routine-exercise__pr-row">
                          <span style={{ color: '#10b981' }}>🏆 PR: {stats.maxWeight > 0 ? `${stats.maxWeight} kg` : '—'}</span>
                          <span style={{ color: '#06b6d4' }}>⏱️ Último: {stats.lastWeight > 0 ? `${stats.lastWeight} kg` : '—'}</span>
                        </div>
                        <div className="routine-exercise__details">
                          <div className="ex-detail"><span>Series</span><strong>{ex.series}</strong></div>
                          <div className="ex-detail"><span>Reps</span><strong>{ex.repeticiones}</strong></div>
                          <div className="ex-detail"><span>Descanso</span><strong>{ex.descansoSegundos}s</strong></div>
                          <div className="ex-detail"><span>Duración</span><strong>{ex.duracionMinutos} min</strong></div>
                          <div className="ex-detail"><span>Calorías</span><strong>{ex.caloriasEstimadas} kcal</strong></div>
                        </div>
                        {ex.notas && <p className="routine-exercise__notes">💡 {ex.notas}</p>}
                        <div className="routine-exercise__footer">
                          <span className="muscle-tag">🎯 {ex.grupoMuscular}</span>
                          <button
                            className="btn-video"
                            onClick={() => setVideoData({ query: `${ex.nombre} ejercicio tutorial`, videoId: ex.videoId })}
                          >
                            ▶️ Ver video
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Cool-down */}
              <div className="routine-phase routine-phase--cooldown">
                <span>❄️</span>
                <div>
                  <strong>Enfriamiento</strong>
                  <p>{currentDay.enfriamiento}</p>
                </div>
              </div>

              {routine.diasDescanso && routine.diasDescanso.length > 0 && (
                <div className="routine-rest-info">
                  😴 Días de descanso: <strong>{routine.diasDescanso.join(', ')}</strong>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Empty state when no routine and form hidden */}
      {!routine && !showForm && (
        <div className="card routine-empty">
          <div>📅</div>
          <h3>Crea tu rutina semanal</h3>
          <p>Selecciona tus días y duración para que la IA genere tu plan</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>Configurar rutina</button>
        </div>
      )}

      {videoData && (
        <VideoModal
          query={videoData.query}
          videoId={videoData.videoId}
          onClose={() => setVideoData(null)}
        />
      )}
    </div>
  );
}
