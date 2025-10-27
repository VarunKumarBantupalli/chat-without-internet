import React, { useEffect, useState } from 'react';
import { fetchSystemState, adminSetSystem } from '../api/admin';

export default function AdminPortal() {
  const [state, setState] = useState({ running: true, reason: '' });
  const [reason, setReason] = useState('');

  useEffect(() => {
    fetchSystemState().then((s) => {
      setState(s);
      setReason(s.reason || '');
    });
  }, []);

  async function toggle() {
    const next = await adminSetSystem(!state.running, reason);
    setState(next);
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Admin Portal</h1>

      <div className="border rounded p-4 space-y-3 max-w-xl">
        <div>
          <span className="font-medium">Current state:</span>{' '}
          {state.running ? (
            <span className="text-green-700">Running</span>
          ) : (
            <span className="text-red-700">Paused</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm">Reason (optional):</label>
          <input
            className="border rounded px-2 py-1 flex-1"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Maintenance window, etc."
          />
        </div>

        <button
          onClick={toggle}
          className={`px-4 py-2 rounded text-white ${state.running ? 'bg-red-600' : 'bg-green-600'}`}
        >
          {state.running ? 'Pause System' : 'Start System'}
        </button>
      </div>
    </div>
  );
}
