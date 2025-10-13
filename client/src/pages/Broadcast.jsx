import React from 'react';
import BroadcastPanel from '../components/BroadcastPanel';

export default function BroadcastPage() {
  const meId = JSON.parse(atob((localStorage.getItem('token') || '').split('.')[1] || 'e30='))?.id;
  return (
    <div className="container mx-auto p-4">
      <div className="border rounded-lg p-4">
        <BroadcastPanel meId={meId} />
      </div>
    </div>
  );
}
