import React, { useEffect, useState } from 'react';
import { API } from '../context/AuthContext';
import SlotCard from '../components/SlotCard';

export default function AdminTrainers() {
  const [trainers, setTrainers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [slots, setSlots]       = useState([]);
  const [date, setDate]         = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading]   = useState(true);

  async function loadTrainers() {
    setLoading(true);
    try {
      const { data } = await API.get(`/admin/trainers?date=${date}`);
      setTrainers(data.trainers);
      if (selected) {
        const t = data.trainers.find(t => t.name === selected);
        if (t) setSlots([...t.slots].sort((a,b) => a.slotNumber - b.slotNumber));
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadTrainers(); }, [date]);

  function selectTrainer(name) {
    setSelected(name);
    const t = trainers.find(t => t.name === name);
    if (t) setSlots([...t.slots].sort((a,b) => a.slotNumber - b.slotNumber));
  }

  async function handleAdminSave({ slotNumber, taskName, status, remarks }) {
    await API.put('/admin/edit-slot', { trainerName: selected, slotNumber, taskName, status, remarks, date });
    await loadTrainers();
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, margin: 0 }}>Trainer Schedules</h1>
          <p style={{ color: '#475569', fontSize: 13, margin: '4px 0 0' }}>Select a trainer to view and edit their slots</p>
        </div>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ padding: '8px 12px', background: '#111827', border: '1px solid #1a2535', borderRadius: 8, color: '#94a3b8', fontSize: 13, outline: 'none' }} />
      </div>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {/* Trainer list */}
        <div style={{ width: 240, flexShrink: 0 }}>
          <div style={{ color: '#475569', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Trainers</div>
          {loading && !trainers.length ? (
            <div style={{ color: '#374151', fontSize: 13 }}>Loading…</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {trainers.map(t => (
                <button
                  key={t.id}
                  onClick={() => selectTrainer(t.name)}
                  style={{
                    background: selected === t.name ? 'rgba(59,130,246,0.1)' : '#111827',
                    border: `1px solid ${selected === t.name ? 'rgba(59,130,246,0.4)' : '#1a2535'}`,
                    borderRadius: 10,
                    padding: '12px 14px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ color: selected === t.name ? '#60a5fa' : '#e2e8f0', fontSize: 13, fontWeight: 500 }}>{t.name}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                    <span style={{ color: '#10b981', fontSize: 11 }}>✅ {t.done}</span>
                    <span style={{ color: '#f59e0b', fontSize: 11 }}>⚡ {t.inProgress}</span>
                    <span style={{ color: '#ef4444', fontSize: 11 }}>⚠ {t.delayed}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Slot grid */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {!selected ? (
            <div style={{ background: '#111827', border: '1px dashed #1a2535', borderRadius: 14, padding: 60, textAlign: 'center', color: '#374151' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>👈</div>
              <div>Select a trainer to view their schedule</div>
            </div>
          ) : (
            <>
              <div style={{ color: '#94a3b8', fontSize: 14, fontWeight: 500, marginBottom: 14 }}>
                {selected}'s Slots — <span style={{ color: '#475569' }}>{date}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {slots.map(slot => (
                  <SlotCard key={slot.slotNumber} slot={slot} onSave={handleAdminSave} readOnly={false} adminMode={true} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
