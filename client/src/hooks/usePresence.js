import { useEffect, useState } from 'react';
import { connectSocket, getSocket } from '../lib/socket';

export default function usePresence() {
  const [online, setOnline] = useState([]); // [{userId, name, status, lastSeen}]

  useEffect(() => {
    // Ensure a socket exists (creates it if absent)
    const s = getSocket() || connectSocket();

    // When server says we're ready, you can optionally set status
    const onReady = () => {
      s.emit('presence:set', { status: 'online' });
    };

    const onList = (users) => {
      // full list of online users (including self)
      setOnline(users);
    };

    const onUpdate = (u) => {
      setOnline((prev) => {
        const map = new Map(prev.map(x => [x.userId, x]));
        if (u.online) {
          map.set(u.userId, { userId: u.userId, name: u.name, status: u.status, lastSeen: u.lastSeen });
        } else {
          map.delete(u.userId);
        }
        return [...map.values()];
      });
    };

    s.on('socket:ready', onReady);
    s.on('presence:list', onList);
    s.on('presence:update', onUpdate);

    // If we are already connected (after a fast refresh), call onReady immediately
    if (s.connected) onReady();

    return () => {
      s.off('socket:ready', onReady);
      s.off('presence:list', onList);
      s.off('presence:update', onUpdate);
    };
  }, []);

  // allow UI to change status
  const setStatus = (status) => (getSocket() || connectSocket())?.emit('presence:set', { status });

  return { online, setStatus };
}
