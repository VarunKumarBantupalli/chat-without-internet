import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getSocket, connectSocket } from '../lib/socket';
import { ensureThread, fetchMessages } from '../api/chat';
import MessageInput from './MessageInput'; 

export default function ChatWindow({ meId, toUser }) {
  const [thread, setThread] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const listRef = useRef(null);

  // ensure socket exists
  useEffect(() => { connectSocket(); }, []);

  // create/find thread & load recent history
  useEffect(() => {
    if (!toUser) return;
    (async () => {
      const t = await ensureThread(toUser.userId);
      setThread(t);
      const history = await fetchMessages(t._id);
      setMsgs(history);
      // scroll bottom
      setTimeout(() => listRef.current?.scrollTo({ top: 1e9, behavior: 'auto' }), 0);
    })();
  }, [toUser]);

  // live receive + ack hook
  useEffect(() => {
    const s = getSocket();
    if (!s) return;

    const onRecv = (m) => {
      if (!thread || m.thread_id !== thread._id) return;
      setMsgs((prev) => [...prev, m]);
      setTimeout(() => listRef.current?.scrollTo({ top: 1e9, behavior: 'smooth' }), 0);
    };
    const onAck = ({ msg }) => {
      if (!thread || msg.thread_id !== thread._id) return;
      setMsgs((prev) => {
        // optimistic flow: we could match tempId; for now just append (already appended on send below)
        return prev;
      });
    };

    s.on('chat:recv', onRecv);
    s.on('chat:ack', onAck);
    return () => {
      s.off('chat:recv', onRecv);
      s.off('chat:ack', onAck);
    };
  }, [thread]);

  const onSend = async (text) => {
    const s = getSocket() || connectSocket();
    if (!thread) return;

    const tempId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // optimistic append
    const optimistic = {
      _id: tempId,
      thread_id: thread._id,
      from: meId,
      to: toUser.userId,
      body: text,
      created_at: new Date().toISOString(),
      optimistic: true,
    };
    setMsgs((prev) => [...prev, optimistic]);
    setTimeout(() => listRef.current?.scrollTo({ top: 1e9, behavior: 'smooth' }), 0);

    // send over socket (with ACK)
    s.emit('chat:send', { to: toUser.userId, body: text, tempId }, (ack) => {
      if (!ack?.ok) {
        // mark failed
        setMsgs((prev) => prev.map(m => m._id === tempId ? { ...m, failed: true } : m));
        return;
      }
      // replace optimistic with server message
      setMsgs((prev) => prev.map(m => m._id === tempId ? ack.msg : m));
    });
  };

  const title = useMemo(() => toUser?.name || toUser?.userId, [toUser]);

  if (!toUser) return <div className="text-gray-500">Select a user to start chatting…</div>;

  return (
    <div className="h-full flex flex-col">
      <div className="font-semibold mb-2">Chat with {title}</div>
      <div ref={listRef} className="flex-1 overflow-y-auto border rounded p-3 space-y-2" style={{ minHeight: 320 }}>
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
      <MessageInput onSend={onSend} disabled={!thread} />
    </div>
  );
}
