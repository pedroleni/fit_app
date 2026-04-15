import { useState, useEffect } from 'react';
import { getWorkouts } from '../services/api';
import { CompletedWorkoutSession, Workout } from '../types';
import './WorkoutHistoryDetailPage.css';

function getLocalHistory(): CompletedWorkoutSession[] {
  try { return JSON.parse(localStorage.getItem('workout-history') || '[]'); }
  catch { return []; }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export function WorkoutHistoryDetailPage() {
  const [localSessions] = useState<CompletedWorkoutSession[]>(getLocalHistory);
  const [apiWorkouts, setApiWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai');

  useEffect(() => {
    setIsLoading(true);
    getWorkouts(50, 0)
      .then((r) => {
        // Filter out AI sessions (they have "—" in title) from manual ones
        const manual = r.data.workouts.filter((w: Workout) => !w.title.includes('—'));
        setApiWorkouts(manual);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const totalCalories = localSessions.reduce((acc, s) => acc + (s.caloriasDelDia || 0), 0);
  const totalMinutes = localSessions.reduce((acc, s) => acc + (s.duration || 0), 0);

  return (
    <div className="history-detail-page animate-fade-up">
      <div className="page-header">
        <div>
          <h2>Historial de Entrenamientos</h2>
          <p className="header-sub">Todas tus sesiones registradas</p>
        </div>
      </div>

      {/* Summary stats */}
      {localSessions.length > 0 && (
        <div className="history-stats">
          <div className="stat-card card">
            <div className="stat-card__icon">🏋️</div>
            <div>
              <div className="stat-card__value">{localSessions.length}</div>
              <div className="stat-card__label">Sesiones IA</div>
            </div>
          </div>
          <div className="stat-card card">
            <div className="stat-card__icon">🔥</div>
            <div>
              <div className="stat-card__value">{totalCalories.toLocaleString()}</div>
              <div className="stat-card__label">kcal totales</div>
            </div>
          </div>
          <div className="stat-card card">
            <div className="stat-card__icon">⏱️</div>
            <div>
              <div className="stat-card__value">{totalMinutes}</div>
              <div className="stat-card__label">minutos totales</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="history-tabs">
        <button className={`history-tab ${activeTab === 'ai' ? 'history-tab--active' : ''}`} onClick={() => setActiveTab('ai')}>
          🤖 Sesiones con IA ({localSessions.length})
        </button>
        <button className={`history-tab ${activeTab === 'manual' ? 'history-tab--active' : ''}`} onClick={() => setActiveTab('manual')}>
          📝 Manuales ({apiWorkouts.length})
        </button>
      </div>

      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '2rem' }}>
          <div className="spinner" />
        </div>
      )}

      {/* AI Sessions */}
      {activeTab === 'ai' && !isLoading && (
        <>
          {localSessions.length === 0 ? (
            <div className="card history-empty">
              <div>🏆</div>
              <h3>Sin sesiones todavía</h3>
              <p>Completa una sesión desde la página de Rutinas para verla aquí</p>
            </div>
          ) : (
            <div className="history-list">
              {localSessions.map((session, i) => (
                <div key={i} className="history-session card animate-fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
                  <div className="history-session__header">
                    <div>
                      <h4>{session.enfoque || session.dia}</h4>
                      <span className="history-session__date">{formatDate(session.date)}</span>
                    </div>
                    <div className="history-session__badges">
                      <span className="badge badge--time">⏱️ {session.duration || session.duracionTotal} min</span>
                      <span className="badge badge--cal">🔥 {session.caloriasDelDia} kcal</span>
                    </div>
                  </div>
                  <div className="history-session__exercises">
                    {session.ejercicios && session.ejercicios.map((ex, j) => {
                      const completedSets = ex.logs ? ex.logs.filter((l) => l.completed) : [];
                      const maxWeight = completedSets.length > 0
                        ? Math.max(...completedSets.map((l) => parseFloat(l.weight) || 0))
                        : 0;
                      return (
                        <div key={j} className="history-exercise">
                          <span className="history-exercise__name">{ex.nombre}</span>
                          <span className="history-exercise__stats">
                            {completedSets.length}/{ex.series} series
                            {maxWeight > 0 && ` · ${maxWeight}kg`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Manual workouts from API */}
      {activeTab === 'manual' && !isLoading && (
        <>
          {apiWorkouts.length === 0 ? (
            <div className="card history-empty">
              <div>📝</div>
              <h3>Sin entrenamientos manuales</h3>
              <p>Añade sesiones desde la página de Entrenamientos</p>
            </div>
          ) : (
            <div className="history-list">
              {apiWorkouts.map((w) => (
                <div key={w.id} className="history-session card">
                  <div className="history-session__header">
                    <div>
                      <h4>{w.title}</h4>
                      <span className="history-session__date">{formatDate(w.date)}</span>
                    </div>
                    <div className="history-session__badges">
                      <span className="badge badge--time">⏱️ {w.duration} min</span>
                      {w.calories && <span className="badge badge--cal">🔥 {w.calories} kcal</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
