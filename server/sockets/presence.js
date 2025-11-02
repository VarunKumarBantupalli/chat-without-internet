// ESM
// Keeps track of who is online and broadcasts join/leave/status updates.
//presence.js

const usersOnline = new Map(); 
// Map<userId, { sockets:Set<string>, status:'online'|'away'|'busy', lastSeen:number, name?:string }>

function getOnlineList() {
  // return minimal public info
  return [...usersOnline.entries()].map(([userId, u]) => ({
    userId,
    name: u.name || 'User',
    status: u.status || 'online',
    lastSeen: u.lastSeen,
  }));
}

export function registerPresence(io) {
  io.on('connection', (socket) => {
    const userId = socket.user.id;
    const name = socket.user.name;

    // Upsert entry
    if (!usersOnline.has(userId)) {
      usersOnline.set(userId, { sockets: new Set(), status: 'online', lastSeen: Date.now(), name });
    }
    const entry = usersOnline.get(userId);
    entry.sockets.add(socket.id);
    entry.lastSeen = Date.now();
    entry.name = name || entry.name;

    // Join rooms (already handled in sockets/index, but safe here too)
    socket.join(`u:${userId}`);
    socket.join('broadcast');

    // Send full list to the newly connected socket
    socket.emit('presence:list', getOnlineList());

    // Notify others that this user came online
    socket.broadcast.emit('presence:update', {
      userId,
      name: entry.name,
      status: entry.status,
      lastSeen: entry.lastSeen,
      online: true,
    });

    // Optional: allow client to set status
    socket.on('presence:set', ({ status } = {}) => {
      if (!['online', 'away', 'busy'].includes(status)) return;
      const e = usersOnline.get(userId);
      if (!e) return;
      e.status = status;
      e.lastSeen = Date.now();
      io.emit('presence:update', {
        userId, name: e.name, status: e.status, lastSeen: e.lastSeen, online: true,
      });
    });

    socket.on('disconnect', () => {
      const e = usersOnline.get(userId);
      if (!e) return;
      e.sockets.delete(socket.id);
      e.lastSeen = Date.now();
      if (e.sockets.size === 0) {
        usersOnline.delete(userId);
        io.emit('presence:update', {
          userId,
          name: e.name,
          status: 'offline',
          lastSeen: e.lastSeen,
          online: false,
        });
      }
    });
  });
}
