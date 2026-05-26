import React, { useEffect, useState } from 'react';
import { useAuth, API } from '../context/AuthContext';
import SlotCard from '../components/SlotCard';

function KpiCard({ label, value, color, icon }) {
  return (
    <div style={{
      background: '#111', border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 10, padding: '14px 16px', flex: 1, minWidth: 100,
    }}>
      <div style={{ color: '#444', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 7 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ fontSize: 24, fontWeight: 800, color }}>{value}</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [slots, setSlots]     = useState([]);
  const [date, setDate]       = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [saveMsg, setSaveMsg] = useState('');

  async function loadSlots() {
    setLoading(true);
    try {
      const { data } = await API.get(`/slots?date=${date}`);
      const sorted = [...data.slots].sort((a, b) => a.slotNumber - b.slotNumber);
      setSlots(sorted);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadSlots(); }, [date]);

  async function handleSave({ slotNumber, taskName, status, remarks }) {
    await API.post('/slots/save', { slotNumber, taskName, status, remarks, date });
    setSaveMsg('Saved ✓');
    setTimeout(() => setSaveMsg(''), 2000);
    await loadSlots();
  }

  const done       = slots.filter(s => s.status === 'Done').length;
  const pending    = slots.filter(s => s.status === 'Pending').length;
  const inProgress = slots.filter(s => s.status === 'In Progress').length;
  const delayed    = slots.filter(s => s.status === 'Delayed').length;
  const progress   = slots.length > 0 ? Math.round((done / (slots.length - 1)) * 100) : 0;

  return (
    <div style={{ padding: '28px 24px', maxWidth: 1100, margin: '0 auto' }}>
      <style>{`
        @media (max-width: 600px) {
          .dash-header { flex-direction: column !important; gap: 10px !important; }
          .kpi-row { gap: 8px !important; }
          .slots-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Header */}
      <div className="dash-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 800, margin: 0 }}>My Daily Slots</h1>
          <p style={{ color: '#444', fontSize: 13, margin: '4px 0 0' }}>Hello, {user?.name} 👋</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {saveMsg && <span style={{ color: '#aaa', fontSize: 13, fontWeight: 500 }}>{saveMsg}</span>}
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{
              padding: '8px 12px',
              background: '#111', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8, color: '#aaa', fontSize: 13, outline: 'none', cursor: 'pointer',
            }}
          />
        </div>
      </div>

      {/* KPI row */}
      <div className="kpi-row" style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <KpiCard label="Done"        value={done}       color="#fff"    icon="✅" />
        <KpiCard label="In Progress" value={inProgress} color="#f59e0b" icon="⚡" />
        <KpiCard label="Pending"     value={pending}    color="#555"    icon="⏳" />
        <KpiCard label="Delayed"     value={delayed}    color="#ef4444" icon="⚠️" />
      </div>

      {/* Progress bar */}
      <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '14px 18px', marginBottom: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
          <span style={{ color: '#555', fontSize: 12 }}>Today's Progress</span>
          <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>{progress}%</span>
        </div>
        <div style={{ height: 5, background: '#1a1a1a', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: '#fff', borderRadius: 3, transition: 'width 0.5s ease' }} />
        </div>
      </div>

      {/* Slots grid */}
      {loading ? (
        <div style={{ color: '#333', textAlign: 'center', padding: 60, fontSize: 13 }}>Loading slots…</div>
      ) : (
        <div className="slots-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 12 }}>
          {slots.map(slot => (
            <SlotCard key={slot.slotNumber} slot={slot} onSave={handleSave} readOnly={false} />
          ))}
        </div>
      )}
    </div>
  );
}
