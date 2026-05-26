import React, { useState } from 'react';

const STATUS_CONFIG = {
  'Pending':     { color: '#555',    bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.06)', dot: '#333'    },
  'In Progress': { color: '#f59e0b', bg: 'rgba(245,158,11,0.07)', border: 'rgba(245,158,11,0.2)',  dot: '#f59e0b' },
  'Done':        { color: '#fff',    bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.15)', dot: '#fff'   },
  'Delayed':     { color: '#ef4444', bg: 'rgba(239,68,68,0.07)',  border: 'rgba(239,68,68,0.2)',   dot: '#ef4444' },
  'Break':       { color: '#666',    bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.06)', dot: '#444'  },
};

const STATUSES = ['Pending', 'In Progress', 'Done', 'Delayed', 'Break'];

export default function SlotCard({ slot, onSave, readOnly, adminMode }) {
  const [editing, setEditing]   = useState(false);
  const [taskName, setTaskName] = useState(slot.taskName || '');
  const [status, setStatus]     = useState(slot.status || 'Pending');
  const [remarks, setRemarks]   = useState(slot.remarks || '');
  const [saving, setSaving]     = useState(false);

  const isBreak = slot.slotNumber === 5 && !adminMode;
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['Pending'];

  async function handleSave() {
    setSaving(true);
    try {
      await onSave({ slotNumber: slot.slotNumber, taskName, status, remarks });
      setEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setTaskName(slot.taskName || '');
    setStatus(slot.status || 'Pending');
    setRemarks(slot.remarks || '');
    setEditing(false);
  }

  const timeSlots = ['9:00–9:45','9:45–10:30','10:30–11:15','11:15–12:00','12:00–12:45','12:45–13:30','13:30–14:15','14:15–15:00','15:00–15:45'];

  return (
    <div style={{
      background: editing ? '#111' : '#0d0d0d',
      border: `1px solid ${editing ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)'}`,
      borderRadius: 10,
      padding: 14,
      transition: 'all 0.2s',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Status stripe */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 2, height: '100%', background: cfg.dot }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, paddingLeft: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 5, padding: '2px 8px', color: '#888', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
          }}>
            SLOT {slot.slotNumber}
          </div>
          <span style={{ color: '#2a2a2a', fontSize: 10 }}>{timeSlots[slot.slotNumber - 1]}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: cfg.bg, border: `1px solid ${cfg.border}`,
            borderRadius: 20, padding: '2px 8px', color: cfg.color, fontSize: 10, fontWeight: 500,
          }}>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: cfg.dot, display: 'inline-block' }} />
            {status}
          </span>
          {!readOnly && !isBreak && !editing && (
            <button
              onClick={() => setEditing(true)}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 5, color: '#666', padding: '3px 8px', fontSize: 10, cursor: 'pointer',
              }}
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ paddingLeft: 8 }}>
        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              value={taskName}
              onChange={e => setTaskName(e.target.value)}
              placeholder="Task name…"
              style={{
                width: '100%', padding: '8px 10px',
                background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 6, color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box',
              }}
            />
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              style={{
                width: '100%', padding: '8px 10px',
                background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 6, color: '#fff', fontSize: 13, outline: 'none', cursor: 'pointer',
              }}
            >
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <textarea
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              placeholder="Add remarks…"
              rows={2}
              style={{
                width: '100%', padding: '8px 10px',
                background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 6, color: '#fff', fontSize: 13, outline: 'none',
                resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
              }}
            />
            <div style={{ display: 'flex', gap: 7 }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  flex: 1, padding: '8px',
                  background: saving ? '#1a1a1a' : '#fff',
                  border: 'none', borderRadius: 6,
                  color: saving ? '#444' : '#000',
                  fontSize: 12, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
                }}
              >
                {saving ? 'Saving…' : '✓ Save'}
              </button>
              <button
                onClick={handleCancel}
                style={{
                  padding: '8px 14px',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 6, color: '#444', fontSize: 12, cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{
              color: taskName ? '#ccc' : '#222', fontSize: 13, fontWeight: taskName ? 500 : 400,
              fontStyle: taskName ? 'normal' : 'italic',
            }}>
              {taskName || 'No task assigned'}
            </div>
            {remarks && (
              <div style={{ color: '#444', fontSize: 11, borderLeft: '1px solid #1a1a1a', paddingLeft: 8, marginTop: 6 }}>{remarks}</div>
            )}
            {slot.updatedAt && (
              <div style={{ color: '#222', fontSize: 9, marginTop: 7 }}>
                Updated {new Date(slot.updatedAt).toLocaleTimeString()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
