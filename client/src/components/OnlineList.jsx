import React from 'react';
import usePresence from '../hooks/usePresence';

export default function OnlineList({ onSelectUser }) {
  const { online } = usePresence();

  if (!online.length) return <div className="p-3 text-sm text-gray-500">No one online yet.</div>;

  return (
    <div className="p-3 space-y-2">
      {online.map((u) => (
        <button
          key={u.userId}
          onClick={() => onSelectUser?.(u)}
          className="w-full flex items-center justify-between rounded-lg border px-3 py-2 hover:bg-gray-50"
          title={`${u.name || 'User'} — ${u.status}`}
        >
          <span className="font-medium">{u.name || 'User'}</span>
          <span className={`text-xs ${u.status === 'busy' ? 'text-red-600' : u.status === 'away' ? 'text-yellow-600' : 'text-green-600'}`}>
            ● {u.status}
          </span>
        </button>
      ))}
    </div>
  );
}
