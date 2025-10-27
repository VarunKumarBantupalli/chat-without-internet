import React, { useEffect, useRef, useState } from 'react';
import { connectSocket, getSocket } from '../lib/socket';
import { fetchMessages, getBroadcastThreadId } from '../api/chat';
import MessageInput from './MessageInput';
import useSystemState from '../hooks/useSystemState';

export default function BroadcastPanel({ meId }) {
  const [threadId, setThreadId] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const listRef = useRef(null);
  const { running } = useSystemState();

  // ensure socket
  useEffect(() => { connectSocket(); }, []);

  // load thread id + history
  useEffect(() => {
    (async () => {
      const id = await getBroadcastThreadId();
      setThreadId(id);
      if (id) {
        const history = await fetchMessages(id);
        setMsgs(history);
        setTimeout(() => listRef.current?.scrollTo({ top: 1e9 }), 0);
      }
    })();
  }, []);

  // live receive
  useEffect(() => {
    const s = getSocket();
    if (!s) return;
    const onRecv = (m) => {
      if (!threadId || m.thread_id !== threadId) return;
      setMsgs(prev => [...prev, m]);
      setTimeout(() => listRef.current?.scrollTo({ top: 1e9, behavior: 'smooth' }), 0);
    };
    s.on('chat:broadcast:recv', onRecv);
    return () => s.off('chat:broadcast:recv', onRecv);
  }, [threadId]);

  const onSend = (text) => {
    const s = getSocket();
    if (!s || !threadId) return;

    // If system is paused, do nothing (UI is also disabled)
    if (!running) {
      // Optional: show a lightweight notice
      console.warn('System paused by admin — broadcast disabled.');
      return;
    }

    const tempId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // optimistic bubble
    const optimistic = {
      _id: tempId,
      thread_id: threadId,
      from: meId,
      body: text,
      created_at: new Date().toISOString(),
      optimistic: true,
    };
    setMsgs(prev => [...prev, optimistic]);
    setTimeout(() => listRef.current?.scrollTo({ top: 1e9, behavior: 'smooth' }), 0);

    s.emit('chat:broadcast', { body: text, tempId }, (ack) => {
      if (!ack?.ok) {
        // mark failed if server rejected (e.g., SYSTEM_PAUSED race)
        setMsgs(prev => prev.map(m => m._id === tempId ? { ...m, failed: true } : m));
        return;
      }
      setMsgs(prev => prev.map(m => m._id === tempId ? ack.msg : m));
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="font-semibold mb-2">Broadcast channel</div>

      {!running && (
        <div className="mb-2 text-xs text-yellow-900 bg-yellow-200 rounded px-2 py-1">
          System paused by admin — sending is disabled.
        </div>
      )}

      <div
        ref={listRef}
        className="flex-1 overflow-y-auto border rounded p-3 space-y-2"
        style={{ minHeight: 320 }}
      >
        {msgs.map((m) => {
          const mine = m.from === meId;
          return (
            <div key={m._id} className={`max-w-[70%] ${mine ? 'ml-auto text-right' : ''}`}>
              <div className={`inline-block rounded px-3 py-2 ${mine ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
                {m.body}
              </div>
              <div className="text-[10px] text-gray-500 mt-0.5">
                {new Date(m.created_at).toLocaleTimeString()} {m.failed ? ' • failed' : (m.optimistic ? ' • sending…' : '')}
              </div>
            </div>
          );
        })}
      </div>

      <MessageInput onSend={onSend} disabled={!threadId || !running} />
    </div>
  );
}
