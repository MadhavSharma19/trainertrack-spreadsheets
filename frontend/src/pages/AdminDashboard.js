import React, { useEffect, useState } from 'react';
import { API } from '../context/AuthContext';

function StatCard({ label, value, color, icon }) {
  return (
    <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '18px 20px', flex: 1, minWidth: 120 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ color: '#444', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>{label}</div>
          <div style={{ fontSize: 30, fontWeight: 800, color }}>{value}</div>
        </div>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{icon}</div>
      </div>
    </div>
  );
}

function AdminSlotMini({ slot, trainerName, onEdit }) {
  const STATUS_COLORS = { 'Done': '#fff', 'In Progress': '#f59e0b', 'Pending': '#333', 'Delayed': '#ef4444', 'Break': '#666' };
  const color = STATUS_COLORS[slot.status] || '#333';
  return (
    <div style={{
      background: '#0a0a0a',
      border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: 7, padding: '10px 12px',
      borderLeft: `2px solid ${color}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
        <span style={{ color: '#555', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>SLOT {slot.slotNumber}</span>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          <span style={{ color, fontSize: 10 }}>{slot.status}</span>
          <button
            onClick={() => onEdit(trainerName, slot)}
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 4, color: '#888', padding: '1px 7px', fontSize: 10, cursor: 'pointer',
            }}
          >Edit</button>
        </div>
      </div>
      <div style={{ color: slot.taskName ? '#888' : '#2a2a2a', fontSize: 12, fontStyle: slot.taskName ? 'normal' : 'italic' }}>
        {slot.taskName || 'No task'}
      </div>
    </div>
  );
}

function TrainerRow({ trainer, onEditSlot }) {
  const donePercent = trainer.slots.length > 0 ? Math.round((trainer.done / (trainer.slots.length - 1)) * 100) : 0;
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, overflow: 'hidden' }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', flexWrap: 'wrap' }}
      >
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0,
        }}>
          {trainer.name[0]}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600 }}>{trainer.name}</div>
          <div style={{ color: '#444', fontSize: 11 }}>{trainer.email}</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ color: '#fff',    fontSize: 11 }}>✅ {trainer.done}</span>
          <span style={{ color: '#f59e0b', fontSize: 11 }}>⚡ {trainer.inProgress}</span>
          <span style={{ color: '#ef4444', fontSize: 11 }}>⚠ {trainer.delayed}</span>
          <div style={{ width: 70, height: 4, background: '#1a1a1a', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${donePercent}%`, background: '#fff', borderRadius: 2 }} />
          </div>
          <span style={{ color: '#666', fontSize: 10, width: 30, textAlign: 'right' }}>{donePercent}%</span>
          <span style={{ color: '#333', fontSize: 13 }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>
      {expanded && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '14px 18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 8 }}>
            {trainer.slots.map(slot => (
              <AdminSlotMini key={slot.slotNumber} slot={slot} trainerName={trainer.name} onEdit={onEditSlot} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EditModal({ data, onClose, onSave }) {
  const [taskName, setTaskName] = useState(data.slot.taskName || '');
  const [status, setStatus]     = useState(data.slot.status || 'Pending');
  const [remarks, setRemarks]   = useState(data.slot.remarks || '');
  const [saving, setSaving]     = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave({ trainerName: data.trainerName, slotNumber: data.slot.slotNumber, taskName, status, remarks });
    setSaving(false);
    onClose();
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }} onClick={onClose}>
      <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 26, width: 420, maxWidth: '100%' }} onClick={e => e.stopPropagation()}>
        <h3 style={{ color: '#fff', margin: '0 0 3px', fontSize: 15, fontWeight: 700 }}>Edit Slot {data.slot.slotNumber}</h3>
        <p style={{ color: '#444', fontSize: 12, margin: '0 0 18px' }}>Trainer: {data.trainerName}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            value={taskName} onChange={e => setTaskName(e.target.value)}
            placeholder="Task name…"
            style={{ padding: '10px 12px', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, color: '#fff', fontSize: 13, outline: 'none' }}
          />
          <select
            value={status} onChange={e => setStatus(e.target.value)}
            style={{ padding: '10px 12px', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, color: '#fff', fontSize: 13, outline: 'none' }}
          >
            {['Pending','In Progress','Done','Delayed','Break'].map(s => <option key={s}>{s}</option>)}
          </select>
          <textarea
            value={remarks} onChange={e => setRemarks(e.target.value)}
            placeholder="Remarks…" rows={3}
            style={{ padding: '10px 12px', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, color: '#fff', fontSize: 13, outline: 'none', resize: 'none', fontFamily: 'inherit' }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button
              onClick={handleSave} disabled={saving}
              style={{ flex: 1, padding: '10px', background: '#fff', border: 'none', borderRadius: 7, color: '#000', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            <button
              onClick={onClose}
              style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, color: '#555', fontSize: 13, cursor: 'pointer' }}
            >Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats]       = useState(null);
  const [trainers, setTrainers] = useState([]);
  const [date, setDate]         = useState(new Date().toISOString().split('T')[0]);
  const [editData, setEditData] = useState(null);
  const [loading, setLoading]   = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [s, t] = await Promise.all([
        API.get(`/admin/stats?date=${date}`),
        API.get(`/admin/trainers?date=${date}`),
      ]);
      setStats(s.data);
      setTrainers(t.data.trainers);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [date]);

  async function handleEditSave({ trainerName, slotNumber, taskName, status, remarks }) {
    await API.put('/admin/edit-slot', { trainerName, slotNumber, taskName, status, remarks, date });
    await load();
  }

  return (
    <div style={{ padding: '28px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <style>{`
        @media (max-width: 600px) {
          .admin-header { flex-direction: column !important; }
          .stat-cards { gap: 8px !important; }
          .stat-cards > * { min-width: 100px !important; }
        }
      `}</style>
      {editData && <EditModal data={editData} onClose={() => setEditData(null)} onSave={handleEditSave} />}

      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 800, margin: 0 }}>Admin Overview</h1>
          <p style={{ color: '#444', fontSize: 13, margin: '4px 0 0' }}>Monitor all trainer activity</p>
        </div>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          style={{ padding: '8px 12px', background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#aaa', fontSize: 13, outline: 'none' }}
        />
      </div>

      {stats && (
        <div className="stat-cards" style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <StatCard label="Total Trainers" value={stats.totalTrainers}   color="#fff"    icon="👥" />
          <StatCard label="Tasks Done"     value={stats.totalDone}       color="#fff"    icon="✅" />
          <StatCard label="In Progress"    value={stats.totalInProgress} color="#f59e0b" icon="⚡" />
          <StatCard label="Pending"        value={stats.totalPending}    color="#555"    icon="⏳" />
          <StatCard label="Delayed"        value={stats.totalDelayed}    color="#ef4444" icon="⚠️" />
        </div>
      )}

      <div>
        <h2 style={{ color: '#444', fontSize: 12, fontWeight: 600, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Trainer Breakdown
        </h2>
        {loading ? (
          <div style={{ color: '#333', textAlign: 'center', padding: 60, fontSize: 13 }}>Loading…</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {trainers.map(t => (
              <TrainerRow key={t.id} trainer={t} onEditSlot={(trainerName, slot) => setEditData({ trainerName, slot })} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
