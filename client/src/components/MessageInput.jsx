import React, { useState } from 'react';

export default function MessageInput({ onSend, disabled }) {
  const [text, setText] = useState('');
  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend?.(text.trim());
    setText('');
  };
  return (
    <form onSubmit={submit} className="mt-3 flex gap-2">
      <input
        className="flex-1 border rounded px-3 py-2"
        placeholder="Type a message"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled}
      />
      <button className="px-4 py-2 rounded bg-blue-600 text-white" disabled={disabled}>Send</button>
    </form>
  );
}
