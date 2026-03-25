import { useEffect, useState } from 'react';
import { getWorkouts, createWorkout, deleteWorkout } from '../services/api';
import { Workout, WorkoutType } from '../types';
import { Plus, Trash2, Dumbbell, Clock, Flame } from 'lucide-react';
import './WorkoutsPage.css';

const WORKOUT_TYPES: WorkoutType[] = ['cardio', 'strength', 'flexibility', 'sports', 'other'];

const TYPE_LABELS: Record<WorkoutType, string> = {
  cardio: 'Cardio', strength: 'Fuerza', flexibility: 'Flexibilidad', sports: 'Deportes', other: 'Otro',
};

const TYPE_EMOJI: Record<WorkoutType, string> = {
  cardio: '🏃', strength: '🏋️', flexibility: '🧘', sports: '⚽', other: '💪',
};

export function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'cardio' as WorkoutType, duration: '', calories: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setIsLoading(true);
    getWorkouts(20, 0)
      .then((r) => { setWorkouts(r.data.workouts); setTotal(r.data.total); })
      .finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createWorkout({
        title: form.title, type: form.type,
        duration: Number(form.duration),
        calories: form.calories ? Number(form.calories) : undefined,
        notes: form.notes || undefined,
        exercises: [],
      });
      setForm({ title: '', type: 'cardio', duration: '', calories: '', notes: '' });
      setShowForm(false);
      load();
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este entrenamiento?')) return;
    await deleteWorkout(id);
    load();
  };

  return (
    <div className="workouts-page animate-fade-up">
      <div className="page-header">
        <div>
          <h2>Entrenamientos</h2>
          <p className="header-sub">{total} sesiones registradas</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={18} /> Nuevo entrenamiento
        </button>
      </div>

      {showForm && (
        <form className="card workout-form animate-fade-up" onSubmit={handleSubmit}>
          <h3>Añadir entrenamiento</h3>
          <div className="form-grid">
            <div className="input-group">
              <label>Nombre *</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ej: Carrera matutina" />
            </div>
            <div className="input-group">
              <label>Tipo *</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as WorkoutType })}>
                {WORKOUT_TYPES.map((t) => <option key={t} value={t}>{TYPE_EMOJI[t]} {TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label>Duración (min) *</label>
              <input required type="number" min="1" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="45" />
            </div>
            <div className="input-group">
              <label>Calorías</label>
              <input type="number" min="0" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} placeholder="300" />
            </div>
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label>Notas</label>
              <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Descripción opcional..." />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '3rem' }}><div className="spinner" /></div>
      ) : workouts.length === 0 ? (
        <div className="card empty-workouts">
          <div className="empty-icon">🏋️</div>
          <h3>Sin entrenamientos todavía</h3>
          <p>Añade tu primera sesión para empezar a rastrear tu progreso</p>
        </div>
      ) : (
        <div className="workouts-list">
          {workouts.map((w) => (
            <div key={w.id} className="workout-card card animate-fade-up">
              <div className="workout-type-badge" data-type={w.type}>
                {TYPE_EMOJI[w.type]} {TYPE_LABELS[w.type]}
              </div>
              <div className="workout-body">
                <h4>{w.title}</h4>
                <div className="workout-meta">
                  <span><Clock size={13} /> {w.duration} min</span>
                  {w.calories && <span><Flame size={13} /> {w.calories} kcal</span>}
                  <span><Dumbbell size={13} /> {new Date(w.date).toLocaleDateString('es-ES')}</span>
                </div>
                {w.notes && <p className="workout-notes">{w.notes}</p>}
              </div>
              <button className="btn btn-danger workout-delete" onClick={() => handleDelete(w.id)}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
