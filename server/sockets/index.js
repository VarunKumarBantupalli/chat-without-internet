// // ESM
// import { registerPresence } from './presence.js';

// export function registerSockets(io) {
//   // Base connection handler that sets rooms and emits a ready event
//   io.on('connection', (socket) => {
//     const userId = socket.user.id;
//     socket.join(`u:${userId}`);
//     socket.join('broadcast');
//     socket.emit('socket:ready', { userId });
//   });

//   // Presence module
//   registerPresence(io);
// }

import { registerPresence } from './presence.js';
import { registerChat } from './chat.js';

export function registerSockets(io) {
  io.on('connection', (socket) => {
    const userId = socket.user.id;
    socket.join(`u:${userId}`);
    socket.join('broadcast');
    socket.emit('socket:ready', { userId });
  });

  registerPresence(io);
  registerChat(io);
}

