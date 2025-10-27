import http from './http';

export async function fetchSystemState() {
  const { data } = await http.get('/system/state'); // auth required
  return data;
}

export async function adminSetSystem(running, reason = '') {
  const { data } = await http.put('/admin/system', { running, reason });
  return data;
}
