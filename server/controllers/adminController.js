import { getSystemState, setSystemState } from '../utils/systemState.js';

export async function adminGetSystem(req, res) {
  res.json(getSystemState());
}

export async function adminSetSystem(req, res) {
  const { running, reason } = req.body || {};
  if (typeof running !== 'boolean') {
    return res.status(400).json({ message: 'running (boolean) is required' });
  }
  const io = req.app.get('io');
  const state = await setSystemState({ running, reason }, io);
  res.json(state);
}
