import http from './http';

export async function ensureThread(toUserId) {
  const { data } = await http.post('/chat/thread', { to: toUserId });
  return data.thread;
}

export async function fetchMessages(threadId, before, limit = 30) {
  const params = { threadId, limit };
  if (before) params.before = before;
  const { data } = await http.get('/chat/messages', { params });
  return data.messages;
}
