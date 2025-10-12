// ESM
import jwt from 'jsonwebtoken';

export function attachSocketAuth(io) {
  io.use((socket, next) => {
    try {
      // Prefer token from handshake.auth; fallback to Authorization header
      const hdr = socket.handshake.auth?.token
        || (socket.handshake.headers?.authorization || '').split(' ')[1];

      if (!hdr) return next(new Error('UNAUTHORIZED: no token'));

      const payload = jwt.verify(hdr, process.env.JWT_SECRET);
      // attach minimal identity for handlers
      socket.user = {
        id: payload.id || payload._id,   // adapt to your JWT shape
        role: payload.role,
        name: payload.name,
      };
      if (!socket.user.id) return next(new Error('UNAUTHORIZED: bad token payload'));

      next();
    } catch (err) {
      next(new Error('UNAUTHORIZED: invalid token'));
    }
  });
}
