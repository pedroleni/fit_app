import { useState, useMemo } from 'react';
import { AIExercise, CompletedWorkoutSession } from '../types';
import { useNavigate } from 'react-router-dom';
import { ExerciseImage } from '../components/ExerciseImage';
import './ExerciseDirectoryPage.css';

// ── Fallback images: local assets (copied to public/) with picsum backup ──
// Once the user copies the generated PNGs to frontend/public/, local paths will work.
// Picsum seeded URLs are the reliable fallback — no API key, always accessible.
const LOCAL_IMAGES: Record<string, string> = {
  pecho:       '/img_pecho.jpg',
  espalda:     '/img_espalda.jpg',
  piernas:     '/img_piernas.jpg',
  hombros:     '/img_hombros.jpg',
  brazos:      '/img_brazos.jpg',
  abdominales: '/img_abdominales.jpg',
  gluteos:     '/img_gluteos.jpg',
};

// Picsum seeded backups (stable — same seed = same photo, looks athletic)
const PICSUM_SEEDS: Record<string, number[]> = {
  pecho:       [453, 582, 701],
  espalda:     [112, 344, 567],
  piernas:     [235, 421, 633],
  hombros:     [178, 392, 541],
  brazos:      [287, 498, 623],
  abdominales: [156, 368, 511],
  gluteos:     [243, 417, 609],
  _default:    [100, 200, 300],
};

function normalizeKey(muscleGroup: string): string {
  return (muscleGroup ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/[\s,/]+/)[0]
    .trim();
}

function getFallbackImage(muscleGroup: string, idx: number): string {
  const key = normalizeKey(muscleGroup);
  // Try local asset first, then picsum
  if (LOCAL_IMAGES[key]) return LOCAL_IMAGES[key];
  const seeds = PICSUM_SEEDS[key] ?? PICSUM_SEEDS['_default'];
  const seed = seeds[idx % seeds.length];
  return `https://picsum.photos/seed/${seed}/600/400`;
}

function getImage(ex: AIExercise, idx: number): string {
  // If the exercise has a valid imagen URL, use it; else derive from muscle group
  if (ex.imagen && ex.imagen.startsWith('http')) return ex.imagen;
  return getFallbackImage(ex.grupoMuscular ?? '', idx);
}


// ── localStorage helpers ──
function getDictionary(): AIExercise[] {
  try { return JSON.parse(localStorage.getItem('exercise-dictionary') || '[]'); }
  catch { return []; }
}
function getHistory(): CompletedWorkoutSession[] {
  try { return JSON.parse(localStorage.getItem('workout-history') || '[]'); }
  catch { return []; }
}

const COMPLEXITY_COLORS: Record<string, string> = {
  principiante: '#10b981',
  intermedio: '#f59e0b',
  avanzado: '#ef4444',
};

const COMPLEXITY_LABELS: Record<string, string> = {
  principiante: '🟢 Principiante',
  intermedio: '🟡 Intermedio',
  avanzado: '🔴 Avanzado',
};

export function ExerciseDirectoryPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [filterComplexity, setFilterComplexity] = useState('');

  const dictionary = useMemo(getDictionary, []);
  const history = useMemo(getHistory, []);

  const exerciseCount = useMemo(() => {
    const counts: Record<string, number> = {};
    history.forEach((s) =>
      s.ejercicios?.forEach((ex) => {
        const k = (ex.nombre ?? '').trim().toLowerCase();
        counts[k] = (counts[k] || 0) + 1;
      })
    );
    return counts;
  }, [history]);

  // Merge dict + history-only exercises
  const allExercises = useMemo(() => {
    const dictNames = new Set(dictionary.map((e) => (e.nombre ?? '').trim().toLowerCase()));
    const fromHistory: AIExercise[] = [];
    history.forEach((s) =>
      s.ejercicios?.forEach((ex) => {
        const k = (ex.nombre ?? '').trim().toLowerCase();
        if (!dictNames.has(k)) {
          dictNames.add(k);
          fromHistory.push({
            nombre: ex.nombre,
            complejidad: ex.complejidad,
            grupoMuscular: ex.grupoMuscular,
            caloriasEstimadas: ex.caloriasEstimadas,
            descripcion: '',
            imagenQuery: '',
            imagen: ex.imagen,
          });
        }
      })
    );
    return [...dictionary, ...fromHistory];
  }, [dictionary, history]);

  const muscleGroups = useMemo(() => {
    const s = new Set(allExercises.map((e) => e.grupoMuscular ?? '').filter(Boolean));
    return Array.from(s).sort();
  }, [allExercises]);

  const filtered = useMemo(() =>
    allExercises.filter((ex) => {
      const ms = !search || (ex.nombre ?? '').toLowerCase().includes(search.toLowerCase());
      const mg = !filterGroup || (ex.grupoMuscular ?? '').toLowerCase() === filterGroup.toLowerCase();
      const mc = !filterComplexity || ex.complejidad === filterComplexity;
      return ms && mg && mc;
    }),
    [allExercises, search, filterGroup, filterComplexity]
  );


  return (
    <div className="dir-page animate-fade-up">
      {/* ── Header ── */}
      <div className="dir-header">
        <div>
          <h2 className="dir-header__title">Directorio de Ejercicios</h2>
          <p className="dir-header__sub">
            {allExercises.length} ejercicio{allExercises.length !== 1 ? 's' : ''} en tu biblioteca
          </p>
        </div>
        <div className="dir-header__stats">
          <div className="dir-stat">
            <span className="dir-stat__val">{allExercises.filter(e => e.complejidad === 'principiante').length}</span>
            <span className="dir-stat__lbl" style={{ color: '#10b981' }}>Básicos</span>
          </div>
          <div className="dir-stat">
            <span className="dir-stat__val">{allExercises.filter(e => e.complejidad === 'intermedio').length}</span>
            <span className="dir-stat__lbl" style={{ color: '#f59e0b' }}>Medios</span>
          </div>
          <div className="dir-stat">
            <span className="dir-stat__val">{allExercises.filter(e => e.complejidad === 'avanzado').length}</span>
            <span className="dir-stat__lbl" style={{ color: '#ef4444' }}>Avanzados</span>
          </div>
        </div>
      </div>

      {/* ── Search & Filters ── */}
      <div className="dir-filters card">
        <div className="dir-search-wrap">
          <span className="dir-search-icon">🔍</span>
          <input
            className="dir-search"
            placeholder="Buscar ejercicio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="dir-search-clear" onClick={() => setSearch('')}>✕</button>
          )}
        </div>
        <div className="dir-chips">
          <button
            className={`dir-chip ${!filterGroup ? 'dir-chip--active' : ''}`}
            onClick={() => setFilterGroup('')}
          >Todos</button>
          {muscleGroups.map((g) => (
            <button
              key={g}
              className={`dir-chip ${filterGroup === g ? 'dir-chip--active' : ''}`}
              onClick={() => setFilterGroup(filterGroup === g ? '' : g)}
            >
              {g}
            </button>
          ))}
        </div>
        <div className="dir-complexity-row">
          {['', 'principiante', 'intermedio', 'avanzado'].map((c) => (
            <button
              key={c}
              className={`dir-complexity-btn ${filterComplexity === c ? 'dir-complexity-btn--active' : ''}`}
              onClick={() => setFilterComplexity(c)}
              style={filterComplexity === c && c !== '' ? { borderColor: COMPLEXITY_COLORS[c], color: COMPLEXITY_COLORS[c] } : {}}
            >
              {c === '' ? 'Todos los niveles' : COMPLEXITY_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Results count ── */}
      {(search || filterGroup || filterComplexity) && (
        <p className="dir-results-count">
          {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
          {search && <> para "<strong>{search}</strong>"</>}
        </p>
      )}

      {/* ── Grid ── */}
      {allExercises.length === 0 ? (
        <div className="card dir-empty">
          <div className="dir-empty__icon">📚</div>
          <h3>Tu biblioteca está vacía</h3>
          <p>Busca ejercicios o genera una rutina con IA para poblar tu directorio</p>
          <div className="dir-empty__actions">
            <button className="btn btn-primary" onClick={() => navigate('/exercises')}>Buscar Ejercicios</button>
            <button className="btn btn-secondary" onClick={() => navigate('/routine')}>Generar Rutina</button>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card dir-empty">
          <div className="dir-empty__icon">🔍</div>
          <h3>Sin resultados</h3>
          <p>Prueba con otros filtros o términos de búsqueda</p>
          <button className="btn btn-secondary" onClick={() => { setSearch(''); setFilterGroup(''); setFilterComplexity(''); }}>
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="dir-grid">
          {filtered.map((ex, i) => {
            const count = exerciseCount[(ex.nombre ?? '').trim().toLowerCase()] || 0;
            const imgSrc = getImage(ex, i);

            return (
              <div
                key={i}
                className="dir-card animate-fade-up"
                style={{ animationDelay: `${Math.min(i, 8) * 0.04}s` }}
                onClick={() => navigate('/exercise-evolution', { state: { exercise: ex } })}
              >
                {/* Image */}
                <div className="dir-card__img-wrap">
                  <ExerciseImage
                    nombre={ex.nombre}
                    grupoMuscular={ex.grupoMuscular}
                    fallbackSrc={imgSrc}
                    className="dir-card__img-wrap"
                  />
                  <div className="dir-card__img-overlay" />

                  {/* Badges on image */}
                  <div className="dir-card__top-badges">
                    <span
                      className="dir-badge dir-badge--complexity"
                      style={{ background: COMPLEXITY_COLORS[ex.complejidad] ?? '#f59e0b' }}
                    >
                      {ex.complejidad}
                    </span>
                    {count > 0 && (
                      <span className="dir-badge dir-badge--count">✅ {count}x</span>
                    )}
                  </div>
                </div>

                {/* Body */}
                <div className="dir-card__body">
                  <h4 className="dir-card__name">{ex.nombre}</h4>

                  <div className="dir-card__meta">
                    <span className="dir-card__muscle">🎯 {ex.grupoMuscular}</span>
                    {ex.caloriasEstimadas > 0 && (
                      <span className="dir-card__cal">🔥 {ex.caloriasEstimadas} kcal</span>
                    )}
                  </div>

                  {ex.descripcion && (
                    <p className="dir-card__desc">{ex.descripcion}</p>
                  )}

                  <div className="dir-card__footer">
                    <span className="dir-card__hint">Ver evolución →</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
