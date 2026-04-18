import { useState, useCallback } from 'react';
import { searchExercises } from '../services/api';
import { AIExercise } from '../types';
import { ExerciseImage } from '../components/ExerciseImage';
import './ExerciseSearchPage.css';

const MUSCLE_GROUPS = [
  { label: 'Pecho', value: 'pecho', emoji: '💪' },
  { label: 'Espalda', value: 'espalda', emoji: '🏋️' },
  { label: 'Piernas', value: 'piernas', emoji: '🦵' },
  { label: 'Hombros', value: 'hombros', emoji: '🔝' },
  { label: 'Brazos', value: 'brazos', emoji: '💪' },
  { label: 'Abdominales', value: 'abdominales', emoji: '🎯' },
  { label: 'Glúteos', value: 'gluteos', emoji: '🍑' },
];

const COMPLEXITY_COLORS: Record<string, string> = {
  principiante: '#10b981',
  intermedio: '#f59e0b',
  avanzado: '#ef4444',
};

function saveExercisesToDictionary(exercises: AIExercise[]) {
  try {
    const existing: AIExercise[] = JSON.parse(localStorage.getItem('exercise-dictionary') || '[]');
    const map = new Map(existing.map((ex) => [ex.nombre, ex]));
    exercises.forEach((ex) => { if (!map.has(ex.nombre)) map.set(ex.nombre, ex); });
    localStorage.setItem('exercise-dictionary', JSON.stringify(Array.from(map.values())));
  } catch { /* ignore */ }
}

interface SearchHistory {
  muscleGroup: string;
  weight: number;
  height: number;
  results: AIExercise[];
  timestamp: string;
}

function getSearchHistory(): SearchHistory[] {
  try { return JSON.parse(localStorage.getItem('exercise-search-history') || '[]'); }
  catch { return []; }
}

function saveSearchHistory(entry: SearchHistory) {
  const prev = getSearchHistory().filter((h) => h.muscleGroup !== entry.muscleGroup);
  localStorage.setItem('exercise-search-history', JSON.stringify([entry, ...prev].slice(0, 10)));
}

export function ExerciseSearchPage() {
  const [exercises, setExercises] = useState<AIExercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [history, setHistory] = useState<SearchHistory[]>(getSearchHistory);
  const [showHistory, setShowHistory] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!selectedGroup) { setError('Selecciona un grupo muscular.'); return; }
    if (!weight || !height) { setError('Introduce peso y altura.'); return; }
    setIsLoading(true);
    setError(null);
    try {
      const res = await searchExercises({ muscleGroup: selectedGroup, weight: Number(weight), height: Number(height) });
      const results: AIExercise[] = res.data.exercises;
      setExercises(results);
      saveExercisesToDictionary(results);
      const entry = { muscleGroup: selectedGroup, weight: Number(weight), height: Number(height), results, timestamp: new Date().toISOString() };
      saveSearchHistory(entry);
      setHistory(getSearchHistory());
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error al buscar ejercicios.';
      setError(msg);
    } finally { setIsLoading(false); }
  }, [selectedGroup, weight, height]);

  const loadFromHistory = (entry: SearchHistory) => {
    setSelectedGroup(entry.muscleGroup);
    setWeight(String(entry.weight));
    setHeight(String(entry.height));
    setExercises(entry.results);
    setShowHistory(false);
  };

  return (
    <div className="exercise-search-page animate-fade-up">
      <div className="page-header">
        <div>
          <h2>Buscar Ejercicios</h2>
          <p className="header-sub">Ejercicios personalizados por grupo muscular con IA</p>
        </div>
        {history.length > 0 && (
          <button className="btn btn-secondary" onClick={() => setShowHistory((v) => !v)}>
            📋 Historial
          </button>
        )}
      </div>

      {/* Search History Dropdown */}
      {showHistory && (
        <div className="card search-history animate-fade-up">
          <h4>Búsquedas recientes</h4>
          {history.map((h, i) => (
            <button key={i} className="search-history-item" onClick={() => loadFromHistory(h)}>
              <span className="search-history-muscle">{h.muscleGroup}</span>
              <span className="search-history-meta">{h.weight}kg · {h.height}cm</span>
              <span className="search-history-date">{new Date(h.timestamp).toLocaleDateString('es-ES')}</span>
            </button>
          ))}
        </div>
      )}

      {/* Search Form */}
      <div className="card exercise-search-form animate-fade-up">
        <div className="muscle-grid">
          {MUSCLE_GROUPS.map((g) => (
            <button
              key={g.value}
              className={`muscle-btn ${selectedGroup === g.value ? 'muscle-btn--active' : ''}`}
              onClick={() => setSelectedGroup(g.value)}
            >
              <span className="muscle-btn__emoji">{g.emoji}</span>
              <span>{g.label}</span>
            </button>
          ))}
        </div>
        <div className="exercise-search-form__row">
          <div className="input-group">
            <label>Peso (kg)</label>
            <input type="number" min="30" max="300" placeholder="75" value={weight} onChange={(e) => setWeight(e.target.value)} />
          </div>
          <div className="input-group">
            <label>Altura (cm)</label>
            <input type="number" min="100" max="250" placeholder="175" value={height} onChange={(e) => setHeight(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={handleSearch} disabled={isLoading || !selectedGroup}>
            {isLoading ? '🔄 Buscando...' : '🔍 Buscar'}
          </button>
        </div>
        {error && (
          <div className="exercise-error">⚠️ {error} <button onClick={() => setError(null)}>✕</button></div>
        )}
      </div>

      {/* Results */}
      {exercises.length > 0 && (
        <div className="exercise-grid">
          {exercises.map((ex, i) => (
            <div key={i} className="exercise-card card animate-fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="exercise-card__img-wrapper" style={{ height: '200px' }}>
                <ExerciseImage
                  nombre={ex.nombre}
                  grupoMuscular={ex.grupoMuscular || selectedGroup}
                  fallbackSrc={ex.imagen ?? ''} // Ex.imagen will be the initial fallback from backend FetchExercisesUseCase
                  className="exercise-card__img-wrapper"
                />
              </div>
              <div className="exercise-card__body">
                <div className="exercise-card__top">
                  <h4>{ex.nombre}</h4>
                  <span className="complexity-badge" style={{ background: COMPLEXITY_COLORS[ex.complejidad] ?? '#f59e0b' }}>
                    {ex.complejidad}
                  </span>
                </div>
                <p className="exercise-card__desc">{ex.descripcion}</p>
                <div className="exercise-card__footer">
                  <span className="muscle-tag">🎯 {ex.grupoMuscular}</span>
                  <span className="cal-tag">🔥 {ex.caloriasEstimadas} kcal/30 min</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {exercises.length === 0 && !isLoading && (
        <div className="card exercise-empty">
          <div>💪</div>
          <h3>Descubre ejercicios personalizados</h3>
          <p>Selecciona un grupo muscular e introduce tus datos para obtener ejercicios adaptados a ti</p>
        </div>
      )}
    </div>
  );
}
