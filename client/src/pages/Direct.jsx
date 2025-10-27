import React, { useState } from 'react';
import OnlineList from '../components/OnlineList';
import ChatWindow from '../components/ChatWindow';
import CallPanel from '../components/CallPanel';

export default function Direct() {
  const [selected, setSelected] = useState(null);
  const meId = JSON.parse(atob((localStorage.getItem('token') || '').split('.')[1] || 'e30='))?.id;

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1 border rounded-lg">
          <div className="p-3 font-semibold border-b">Available users</div>
          <OnlineList onSelectUser={setSelected} />
        </div>
        <div className="col-span-2 border rounded-lg p-4">
          <ChatWindow meId={meId} toUser={selected} />
        </div>
        <div className="border-t pt-4">
          <CallPanel meId={meId} targetUser={selected} />
        </div>
      </div>
    </div>
  );
}
