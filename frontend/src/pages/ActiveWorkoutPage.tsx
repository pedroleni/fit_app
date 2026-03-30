import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createWorkout } from '../services/api';
import { RoutineDay, ActiveWorkoutExercise, ActiveWorkoutLog } from '../types';
import './ActiveWorkoutPage.css';

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function initExercises(day: RoutineDay): ActiveWorkoutExercise[] {
  return day.ejercicios.map((ex) => ({
    ...ex,
    logs: Array.from({ length: ex.series }, () => ({ weight: '', reps: '', completed: false })),
  }));
}

export function ActiveWorkoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const workoutDay: RoutineDay | undefined = (location.state as { workoutDay?: RoutineDay })?.workoutDay;

  const [exercises, setExercises] = useState<ActiveWorkoutExercise[]>(() =>
    workoutDay ? initExercises(workoutDay) : []
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [restCountdown, setRestCountdown] = useState<number | null>(null);
  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Main timer
  useEffect(() => {
    intervalRef.current = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const startRest = useCallback((seconds: number) => {
    if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    setRestCountdown(seconds);
    restIntervalRef.current = setInterval(() => {
      setRestCountdown((prev) => {
        if (prev === null || prev <= 1) {
          if (restIntervalRef.current) clearInterval(restIntervalRef.current);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const updateLog = (exIdx: number, setIdx: number, field: keyof ActiveWorkoutLog, value: string | boolean) => {
    setExercises((prev) => {
      const updated = prev.map((ex, i) => {
        if (i !== exIdx) return ex;
        const newLogs = ex.logs.map((log, j) => {
          if (j !== setIdx) return log;
          return { ...log, [field]: value };
        });
        return { ...ex, logs: newLogs };
      });
      return updated;
    });
  };

  const completeSet = (exIdx: number, setIdx: number) => {
    const ex = exercises[exIdx];
    const log = ex.logs[setIdx];
    if (!log.completed) {
      updateLog(exIdx, setIdx, 'completed', true);
      startRest(ex.descansoSegundos || 60);
    } else {
      updateLog(exIdx, setIdx, 'completed', false);
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
      setRestCountdown(null);
    }
  };

  const completedSets = exercises.reduce((acc, ex) => acc + ex.logs.filter((l) => l.completed).length, 0);
  const totalSets = exercises.reduce((acc, ex) => acc + ex.logs.length, 0);
  const progressPct = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  const handleFinish = async () => {
    if (!workoutDay) return;
    setIsSaving(true);
    try {
      // Save to localStorage for history/directory/evolution
      const session = {
        dia: workoutDay.dia,
        enfoque: workoutDay.enfoque,
        duracionTotal: workoutDay.duracionTotal,
        caloriasDelDia: workoutDay.caloriasDelDia,
        ejercicios: exercises,
        date: new Date().toISOString(),
        duration: Math.round(elapsedSeconds / 60),
      };
      const prev = JSON.parse(localStorage.getItem('workout-history') || '[]');
      localStorage.setItem('workout-history', JSON.stringify([session, ...prev]));

      // Also save to backend
      const totalCalories = exercises.reduce((acc, ex) => acc + (ex.caloriasEstimadas || 0), 0);
      await createWorkout({
        title: `${workoutDay.dia} — ${workoutDay.enfoque}`,
        type: 'strength',
        duration: Math.round(elapsedSeconds / 60),
        calories: totalCalories,
        notes: `Sesión generada por IA. Ejercicios: ${exercises.map((e) => e.nombre).join(', ')}`,
        exercises: exercises.map((ex) => ({
          name: ex.nombre,
          sets: ex.series,
          notes: ex.grupoMuscular,
        })),
      });
    } catch { /* swallow API errors — local storage already saved */ }
    finally {
      setIsSaving(false);
      navigate('/workout-history-detail');
    }
  };

  if (!workoutDay) {
    return (
      <div className="active-workout-page animate-fade-up">
        <div className="card active-workout-empty">
          <div>⚡</div>
          <h3>Sin entrenamiento activo</h3>
          <p>Ve a la página de Rutina y pulsa "Empezar" para iniciar tu sesión.</p>
          <button className="btn btn-primary" onClick={() => navigate('/routine')}>Ir a Rutinas</button>
        </div>
      </div>
    );
  }

  return (
    <div className="active-workout-page animate-fade-up">
      {/* Header */}
      <div className="aw-header">
        <div>
          <h2>{workoutDay.dia} — {workoutDay.enfoque}</h2>
          <div className="aw-timer">⏱️ {formatTime(elapsedSeconds)}</div>
        </div>
        <div className="aw-header-right">
          <div className="aw-progress-text">{completedSets}/{totalSets} series</div>
          <button className="btn btn-primary" onClick={handleFinish} disabled={isSaving}>
            {isSaving ? 'Guardando...' : '🏁 Finalizar'}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="aw-progress-bar">
        <div className="aw-progress-bar__fill" style={{ width: `${progressPct}%` }} />
      </div>

      {/* Rest countdown */}
      {restCountdown !== null && (
        <div className="aw-rest-banner">
          <span>😮‍💨 Descanso:</span>
          <strong>{formatTime(restCountdown)}</strong>
          <button onClick={() => { if (restIntervalRef.current) clearInterval(restIntervalRef.current); setRestCountdown(null); }}>
            Saltar
          </button>
        </div>
      )}

      {/* Exercise tabs */}
      <div className="aw-tabs">
        {exercises.map((ex, i) => {
          const done = ex.logs.filter((l) => l.completed).length;
          const all = ex.logs.length;
          const full = done === all;
          return (
            <button
              key={i}
              className={`aw-tab ${currentExIdx === i ? 'aw-tab--active' : ''} ${full ? 'aw-tab--done' : ''}`}
              onClick={() => setCurrentExIdx(i)}
            >
              {full ? '✅' : `${done}/${all}`} {ex.nombre.split(' ').slice(0, 2).join(' ')}
            </button>
          );
        })}
      </div>

      {/* Current exercise */}
      {exercises[currentExIdx] && (() => {
        const ex = exercises[currentExIdx];
        return (
          <div className="aw-exercise card animate-fade-up" key={currentExIdx}>
            <div className="aw-exercise__header">
              <h3>{ex.nombre}</h3>
              <div className="aw-exercise__meta">
                <span>🎯 {ex.grupoMuscular}</span>
                <span>⏱️ {ex.descansoSegundos}s descanso</span>
              </div>
            </div>

            <div className="aw-sets">
              <div className="aw-sets__header">
                <span>Serie</span>
                <span>Peso (kg)</span>
                <span>Reps</span>
                <span>✓</span>
              </div>
              {ex.logs.map((log, setIdx) => (
                <div key={setIdx} className={`aw-set ${log.completed ? 'aw-set--done' : ''}`}>
                  <span className="aw-set__num">{setIdx + 1}</span>
                  <input
                    type="number" min="0" placeholder="0"
                    value={log.weight}
                    onChange={(e) => updateLog(currentExIdx, setIdx, 'weight', e.target.value)}
                    className="aw-set__input"
                    disabled={log.completed}
                  />
                  <input
                    type="number" min="0" placeholder={String(ex.repeticiones) || '0'}
                    value={log.reps}
                    onChange={(e) => updateLog(currentExIdx, setIdx, 'reps', e.target.value)}
                    className="aw-set__input"
                    disabled={log.completed}
                  />
                  <button
                    className={`aw-set__check ${log.completed ? 'aw-set__check--done' : ''}`}
                    onClick={() => completeSet(currentExIdx, setIdx)}
                  >
                    {log.completed ? '✅' : '○'}
                  </button>
                </div>
              ))}
            </div>

            {ex.notas && <p className="aw-exercise__notes">💡 {ex.notas}</p>}

            <div className="aw-exercise__nav">
              {currentExIdx > 0 && (
                <button className="btn btn-secondary" onClick={() => setCurrentExIdx((v) => v - 1)}>← Anterior</button>
              )}
              {currentExIdx < exercises.length - 1 && (
                <button className="btn btn-primary" onClick={() => setCurrentExIdx((v) => v + 1)}>Siguiente →</button>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
