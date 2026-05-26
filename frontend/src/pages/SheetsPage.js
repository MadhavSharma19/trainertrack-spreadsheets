import React, { useEffect, useState, useCallback } from 'react';
import { API, BACKEND_URL } from '../context/AuthContext';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/YOUR_GOOGLE_SHEET_ID/edit';

export default function SheetsPage() {
  const [info, setInfo]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [syncing, setSyncing]   = useState(false);
  const [syncMsg, setSyncMsg]   = useState('');
  const [lastSync, setLastSync] = useState(null);

  async function loadInfo() {
    try {
      const { data } = await API.get('/sheets/info');
      setInfo(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Auto-refresh info every 30 seconds
  useEffect(() => {
    loadInfo();
    const interval = setInterval(loadInfo, 30000);
    return () => clearInterval(interval);
  }, []);

  async function handleDownload() {
    try {
      const token = localStorage.getItem('tt_token');
      const res   = await fetch(`${BACKEND_URL}/admin/download-excel`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { alert('No data file yet — save some slots first!'); return; }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = 'trainer-data.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Download failed');
    }
  }

  async function handleGoogleSheetSync() {
    setSyncing(true);
    setSyncMsg('');
    try {
      const { data } = await API.post('/sheets/sync');
      setSyncMsg(data.message || 'Synced successfully!');
      setLastSync(new Date().toLocaleTimeString());
      await loadInfo();
    } catch (e) {
      setSyncMsg(e?.response?.data?.error || 'Sync failed — check Google Sheets configuration in backend.');
    } finally {
      setSyncing(false);
    }
  }

  const totalRows = info
    ? Object.values(info.rowCounts || {}).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div style={{ padding: '28px 24px', maxWidth: 900, margin: '0 auto' }}>
      <style>{`
        @media (max-width: 600px) {
          .sheets-header { flex-direction: column !important; align-items: flex-start !important; }
          .sheets-actions { flex-direction: column !important; width: 100%; }
          .sheets-actions button { width: 100% !important; }
          .row-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>

      {/* Header */}
      <div className="sheets-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, gap: 14, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: 0 }}>Data Storage & Sync</h1>
          <p style={{ color: '#555', fontSize: 13, margin: '4px 0 0' }}>
            Data auto-saves to Excel on every slot update. Sync to Google Sheets anytime.
          </p>
        </div>
        <div className="sheets-actions" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={handleGoogleSheetSync}
            disabled={syncing}
            style={{
              padding: '9px 16px',
              background: syncing ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 8, color: syncing ? '#555' : '#ccc',
              fontSize: 13, fontWeight: 600, cursor: syncing ? 'wait' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all 0.2s',
            }}
          >
            {syncing ? '⟳ Syncing…' : '🔄 Sync to Google Sheets'}
          </button>
          <button
            onClick={handleDownload}
            style={{
              padding: '9px 16px',
              background: '#fff',
              border: 'none',
              borderRadius: 8, color: '#000',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            ⬇ Download Excel
          </button>
        </div>
      </div>

      {/* Sync feedback */}
      {syncMsg && (
        <div style={{
          background: syncMsg.includes('fail') || syncMsg.includes('error') || syncMsg.includes('Failed')
            ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${syncMsg.includes('fail') || syncMsg.includes('error') || syncMsg.includes('Failed')
            ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: 10, padding: '12px 16px', marginBottom: 20,
          color: syncMsg.includes('fail') || syncMsg.includes('Failed') ? '#f87171' : '#aaa',
          fontSize: 13,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span>{syncMsg.includes('fail') || syncMsg.includes('Failed') ? '⚠' : '✓'}</span>
          <span>{syncMsg}</span>
          {lastSync && !syncMsg.includes('fail') && (
            <span style={{ color: '#444', marginLeft: 'auto' }}>at {lastSync}</span>
          )}
        </div>
      )}

      {/* Excel Status Banner */}
      <div style={{
        background: info?.exists ? 'rgba(255,255,255,0.03)' : 'rgba(245,158,11,0.05)',
        border: `1px solid ${info?.exists ? 'rgba(255,255,255,0.08)' : 'rgba(245,158,11,0.2)'}`,
        borderRadius: 12, padding: '16px 20px', marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 24 }}>{info?.exists ? '📄' : '⏳'}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: info?.exists ? '#fff' : '#f59e0b', fontSize: 13, fontWeight: 600 }}>
            {loading ? 'Checking…' : info?.exists
              ? 'Excel file active — auto-saving on every slot update'
              : 'Excel file will be created on first slot save'}
          </div>
          {info?.exists && (
            <div style={{ color: '#444', fontSize: 12, marginTop: 3 }}>
              {totalRows} total rows • auto-refreshes every 30s
            </div>
          )}
        </div>
      </div>

      {/* Google Sheets Link */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 12, padding: '16px 20px', marginBottom: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22 }}>📊</span>
          <div>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>Google Sheets (Live Spreadsheet)</div>
            <div style={{ color: '#444', fontSize: 12, marginTop: 2 }}>
              Auto-updates when you click "Sync to Google Sheets". Set up the backend config to enable.
            </div>
          </div>
        </div>
        <a
          href={SHEET_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '8px 14px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8, color: '#ccc', fontSize: 12, fontWeight: 600,
            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5,
          }}
        >
          Open Sheet ↗
        </a>
      </div>

      {/* Row counts grid */}
      {info?.exists && (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '20px 22px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ color: '#ccc', fontSize: 12, fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Rows Saved Per Sheet
            </h3>
            <span style={{ color: '#333', fontSize: 11 }}>Total: {totalRows}</span>
          </div>
          <div className="row-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8 }}>
            {Object.entries(info.rowCounts || {}).map(([sheet, count]) => (
              <div key={sheet} style={{
                background: '#0a0a0a',
                border: `1px solid ${count > 0 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)'}`,
                borderRadius: 8, padding: '12px 14px',
              }}>
                <div style={{ color: '#555', fontSize: 10, fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{sheet}</div>
                <div style={{ color: count > 0 ? '#fff' : '#222', fontSize: 22, fontWeight: 800 }}>{count}</div>
                <div style={{ color: '#333', fontSize: 10 }}>rows</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How it works */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px 22px', marginBottom: 20 }}>
        <h3 style={{ color: '#ccc', fontSize: 12, fontWeight: 600, margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>How It Works</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { icon: '💾', title: 'Auto-Save to Excel', desc: 'Every slot save instantly writes to trainer-data.xlsx on the server.' },
            { icon: '🔄', title: 'No Duplicates', desc: 'Same slot (trainer + date + slot number) updates in place — never creates duplicates.' },
            { icon: '📊', title: 'Sync to Google Sheets', desc: 'Click "Sync to Google Sheets" to push all current data to your live spreadsheet.' },
            { icon: '📅', title: 'Full History', desc: 'Every date is stored — full day-by-day history of all trainer activity.' },
            { icon: '🔁', title: 'Survives Restarts', desc: 'Data is reloaded from Excel on server restart — zero data loss.' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
              <div>
                <div style={{ color: '#ccc', fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{item.title}</div>
                <div style={{ color: '#444', fontSize: 12 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Column structure */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px 22px' }}>
        <h3 style={{ color: '#ccc', fontSize: 12, fontWeight: 600, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Column Structure</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {['TRAINER NAME','DATE','SLOT','TASK NAME','DONE?','STATUS','REMARKS','UPDATED AT'].map((col, i) => (
            <span key={i} style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 5, padding: '4px 10px',
              color: '#888', fontSize: 11, fontFamily: 'monospace',
            }}>
              {col}
            </span>
          ))}
        </div>
        <div style={{ color: '#333', fontSize: 11, marginTop: 12 }}>
          File: <code style={{ color: '#555', background: '#0a0a0a', padding: '2px 6px', borderRadius: 4 }}>backend/trainer-data.xlsx</code>
        </div>
      </div>
    </div>
  );
}
