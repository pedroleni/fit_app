import { useEffect, useState } from 'react';
import { getWaterToday, getWaterHistory, logWater } from '../services/api';
import { WaterIntake } from '../types';
import { Droplets, Plus, Trash2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './WaterPage.css';

const QUICK_AMOUNTS = [150, 250, 330, 500, 750];
const DAILY_GOAL = 2500;

export function WaterPage() {
  const [entries, setEntries] = useState<WaterIntake[]>([]);
  const [totalMl, setTotalMl] = useState(0);
  const [history, setHistory] = useState<WaterIntake[]>([]);
  const [customAmount, setCustomAmount] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = () => {
    Promise.all([getWaterToday(), getWaterHistory(14)])
      .then(([todayRes, histRes]) => {
        setEntries(todayRes.data.entries);
        setTotalMl(todayRes.data.totalMl);
        setHistory(histRes.data.history);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(loadData, []);

  const log = async (amount: number) => {
    if (!amount || amount <= 0) return;
    await logWater({ amount });
    loadData();
    setCustomAmount('');
  };

  const waterPct = Math.min((totalMl / DAILY_GOAL) * 100, 100);

  // Aggregate history by day for chart
  const chartData = Object.entries(
    history.reduce<Record<string, number>>((acc, e) => {
      const day = new Date(e.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
      acc[day] = (acc[day] ?? 0) + e.amount;
      return acc;
    }, {})
  ).slice(-7).map(([day, total]) => ({ day, ml: total }));

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}><div className="spinner" /></div>;
  }

  return (
    <div className="water-page animate-fade-up">
      <div className="page-header">
        <div>
          <h2>Hidratación</h2>
          <p className="header-sub">Objetivo diario: {DAILY_GOAL} ml</p>
        </div>
      </div>

      <div className="water-layout">
        <div className="water-left">
          {/* Progress circle */}
          <div className="card goal-card">
            <div className="water-circle-wrap">
              <svg className="water-ring" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" className="ring-bg" />
                <circle
                  cx="60" cy="60" r="52"
                  className="ring-fill"
                  strokeDasharray={`${(2 * Math.PI * 52 * waterPct) / 100} ${2 * Math.PI * 52}`}
                  strokeDashoffset="0"
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div className="circle-label">
                <Droplets size={20} color="#00d4aa" />
                <span className="circle-ml">{totalMl}</span>
                <span className="circle-unit">ml</span>
                <span className="circle-pct">{waterPct.toFixed(0)}%</span>
              </div>
            </div>
            <p className="goal-text">
              {totalMl >= DAILY_GOAL ? '🎉 ¡Objetivo alcanzado!' : `Faltan ${DAILY_GOAL - totalMl} ml para tu objetivo`}
            </p>
          </div>

          {/* Quick add buttons */}
          <div className="card quick-add-card">
            <h3>Añadir rápido</h3>
            <div className="quick-btns">
              {QUICK_AMOUNTS.map((amt) => (
                <button key={amt} className="btn btn-secondary quick-btn" onClick={() => log(amt)}>
                  <Droplets size={14} /> {amt} ml
                </button>
              ))}
            </div>
            <div className="custom-add">
              <input
                type="number"
                placeholder="Cantidad personalizada (ml)"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="custom-input"
                min="1"
              />
              <button className="btn btn-primary" onClick={() => log(Number(customAmount))}>
                <Plus size={16} /> Añadir
              </button>
            </div>
          </div>
        </div>

        <div className="water-right">
          {/* History chart */}
          {chartData.length > 1 && (
            <div className="card chart-card">
              <h3>Últimos 7 días</h3>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00d4aa" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#00d4aa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="var(--color-text-muted)" fontSize={11} />
                  <YAxis stroke="var(--color-text-muted)" fontSize={11} />
                  <Tooltip
                    contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                    formatter={(v: number) => [`${v} ml`, 'Agua']}
                  />
                  <Area type="monotone" dataKey="ml" stroke="#00d4aa" fill="url(#waterGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Today's entries */}
          <div className="card entries-card">
            <h3>Registros de hoy ({entries.length})</h3>
            {entries.length === 0 ? (
              <p className="empty-state">No hay registros de hoy. ¡Empieza a hidratarte!</p>
            ) : (
              <div className="entries-list">
                {entries.map((e) => (
                  <div key={e.id} className="entry-row">
                    <Droplets size={15} color="#00d4aa" />
                    <span className="entry-amount">{e.amount} ml</span>
                    <span className="entry-time">
                      {new Date(e.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
