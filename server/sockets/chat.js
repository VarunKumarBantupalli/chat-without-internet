import Joi from 'joi';
import Thread from '../models/Thread.js';
import Message from '../models/Message.js';
import mongoose from 'mongoose';

const sendSchema = Joi.object({
  to: Joi.string().required(),         // userId (for direct)
  body: Joi.string().trim().min(1).max(2000).required(),
  tempId: Joi.string().optional()      // client-generated optimistic id
});

function pair(a, b) {
  const A = new mongoose.Types.ObjectId(a).toString();
  const B = new mongoose.Types.ObjectId(b).toString();
  return A < B ? [A, B] : [B, A];
}

export function registerChat(io) {
  io.on('connection', (socket) => {
    const me = socket.user.id;

    socket.on('chat:send', async (payload, cb) => {
      try {
        const { value, error } = sendSchema.validate(payload);
        if (error) throw new Error(error.details[0].message);
        const { to, body, tempId } = value;

        // upsert/find direct thread
        const [a, b] = pair(me, to);
        let thread = await Thread.findOne({ type: 'direct', members: { $all: [a, b], $size: 2 } });
        if (!thread) {
          thread = await Thread.create({ type: 'direct', members: [a, b], last_msg_at: new Date() });
        }

        const msg = await Message.create({
          thread_id: thread._id,
          from: me,
          to,
          body,
          created_at: new Date(),
        });

        await Thread.updateOne({ _id: thread._id }, { $set: { last_msg_at: msg.created_at } });

        const wire = {
          _id: msg._id.toString(),
          thread_id: thread._id.toString(),
          from: me,
          to,
          body,
          created_at: msg.created_at,
        };

        // ACK to sender
        cb && cb({ ok: true, tempId, msg: wire });
        socket.emit('chat:ack', { tempId, msg: wire }); // double-safety if not using cb

        // Deliver to recipient
        io.to(`u:${to}`).emit('chat:recv', wire);
      } catch (e) {
        cb && cb({ ok: false, error: e.message });
      }
    });
  });
}
