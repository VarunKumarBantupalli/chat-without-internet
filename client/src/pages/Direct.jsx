import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Phone, Video, Circle, Search } from "lucide-react";
import usePresence from "../hooks/usePresence";
import useSystemState from "../hooks/useSystemState";
import { getSocket, connectSocket } from "../lib/socket";
import { ensureThread, fetchMessages } from "../api/chat";
import MessageInput from "../components/MessageInput";
import useCall from "../hooks/useCall";

const AVATAR = (name = "User") =>
  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
    name
  )}&backgroundType=gradientLinear&fontFamily=Helvetica`;

export default function Direct() {
  const { id } = useParams();            // /chat/:userId
  const navigate = useNavigate();
  const { online } = usePresence();      // [{ userId, name, status }, ...]
  const { running } = useSystemState();

  // useCall for incoming popup + quick actions
  const {
    state: callState,
    remoteUser,
    incomingHasVideo,
    decline
  } = useCall(null); // we only need incoming state here

  // decode meId from token
  const token = localStorage.getItem("token") || "";
  let meId = null;
  try { meId = JSON.parse(atob(token.split(".")[1] || "e30="))?.id || null; } catch {}

  // chat state
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [thread, setThread] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const listRef = useRef(null);

  useEffect(() => { connectSocket(); }, []);

  // hydrate selected from presence / URL
  useEffect(() => {
    if (!id) return;
    const hit = online.find(u => u.userId === id);
    if (hit) setSelected(hit);
    else if (!selected) setSelected({ userId: id, name: id, status: "online" });
  }, [id, online]); // keep synced

  // find/create thread + history
  useEffect(() => {
    if (!selected) return;
    (async () => {
      const t = await ensureThread(selected.userId);
      setThread(t);
      const history = await fetchMessages(t._id);
      setMsgs(history);
      setTimeout(() => listRef.current?.scrollTo({ top: 1e9, behavior: "auto" }), 0);
    })();
  }, [selected]);

  // live receive / ack
  useEffect(() => {
    const s = getSocket();
    if (!s) return;
    const onRecv = (m) => {
      if (!thread || m.thread_id !== thread._id) return;
      setMsgs(prev => [...prev, m]);
      setTimeout(() => listRef.current?.scrollTo({ top: 1e9, behavior: "smooth" }), 0);
    };
    const onAck = ({ msg }) => {
      if (!thread || msg.thread_id !== thread._id) return;
      setMsgs(prev => prev);
    };
    s.on("chat:recv", onRecv);
    s.on("chat:ack", onAck);
    return () => {
      s.off("chat:recv", onRecv);
      s.off("chat:ack", onAck);
    };
  }, [thread]);

  const onSend = async (text) => {
    const s = getSocket() || connectSocket();
    if (!thread || !selected) return;
    const tempId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const optimistic = {
      _id: tempId,
      thread_id: thread._id,
      from: meId,
      to: selected.userId,
      body: text,
      created_at: new Date().toISOString(),
      optimistic: true,
    };
    setMsgs(prev => [...prev, optimistic]);
    setTimeout(() => listRef.current?.scrollTo({ top: 1e9, behavior: "smooth" }), 0);

    s.emit("chat:send", { to: selected.userId, body: text, tempId }, (ack) => {
      if (!ack?.ok) {
        setMsgs(prev => prev.map(m => (m._id === tempId ? { ...m, failed: true } : m)));
        return;
      }
      setMsgs(prev => prev.map(m => (m._id === tempId ? ack.msg : m)));
    });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return online;
    return online.filter(u => (u?.name || "").toLowerCase().includes(q));
  }, [query, online]);

  const title = useMemo(() => selected?.name || selected?.userId || "—", [selected]);

  const goAudio = () => selected && navigate(`/call/audio/${selected.userId}`);
  const goVideo = () => selected && navigate(`/call/video/${selected.userId}`);

  return (
    <div className="min-h-screen bg-ink-900 text-paper-50">
      <div className="container mx-auto p-4 grid gap-4 md:grid-cols-3">

        {/* RIGHT: chat */}
        <section className="md:col-span-2 rounded-2xl border border-ink-700 bg-ink-800/60 flex flex-col">
          {/* header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-ink-700">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={AVATAR(selected?.name)}
                alt={selected?.name || "User"}
                className="h-9 w-9 rounded-full border border-ink-600 bg-ink-700 object-cover"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-medium truncate max-w-[58vw] sm:max-w-[40vw]">{title}</h2>
                  {selected && (
                    <span className="inline-flex items-center gap-1 text-xs text-green-400">
                      <Circle className="h-2 w-2 fill-green-400 text-green-400" />
                      online
                    </span>
                  )}
                </div>
                <p className="text-xs text-paper-400 truncate">Say hello 👋</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={goAudio}
                className="p-2 rounded-xl bg-ink-700 text-paper-50 border border-ink-600 hover:bg-ink-700/70 transition"
                title="Audio call"
                disabled={!selected || !running}
              >
                <Phone className="h-4 w-4" />
              </button>
              <button
                onClick={goVideo}
                className="p-2 rounded-xl bg-ink-700 text-paper-50 border border-ink-600 hover:bg-ink-700/70 transition"
                title="Video call"
                disabled={!selected || !running}
              >
                <Video className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* messages */}
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto p-3 space-y-2 bg-ink-900/35"
            style={{ minHeight: 320 }}
          >
            {msgs.map((m) => {
              const mine = m.from === meId;
              return (
                <div key={m._id} className={`max-w-[72%] ${mine ? "ml-auto text-right" : ""}`}>
                  <div
                    className={`inline-block rounded-2xl px-3 py-2 ${
                      mine ? "bg-brand text-paper-50" : "bg-ink-700/70 text-paper-50 border border-ink-600"
                    }`}
                  >
                    {m.body}
                  </div>
                  <div className="text-[10px] text-paper-400 mt-0.5">
                    {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    {m.failed ? " • failed" : m.optimistic ? " • sending…" : ""}
                  </div>
                </div>
              );
            })}
          </div>

          {/* input */}
          <div className="border-t border-ink-700 p-3">
            <MessageInput onSend={onSend} disabled={!thread || !running} />
          </div>
        </section>
      </div>

      {/* INCOMING CALL POP-UP */}
      {callState === "incoming" && remoteUser && (
        <div className="fixed bottom-6 right-6 z-40 w-[320px] rounded-2xl border border-ink-700 bg-ink-800/90 backdrop-blur shadow-xl p-4">
          <div className="flex items-center gap-3">
            <img
              src={AVATAR(remoteUser?.name || remoteUser?.userId)}
              alt="caller"
              className="h-12 w-12 rounded-full border border-ink-600 bg-ink-700 object-cover"
            />
            <div className="min-w-0">
              <div className="font-medium truncate">{remoteUser?.name || remoteUser?.userId}</div>
              <div className="text-xs text-paper-400">
                Incoming {incomingHasVideo ? "video" : "audio"} call
              </div>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              className="flex-1 rounded-xl bg-brand text-paper-50 py-2"
              onClick={() =>
                navigate(`/call/${incomingHasVideo ? "video" : "audio"}/${remoteUser.userId}`)
              }
            >
              Accept
            </button>
            <button
              className="flex-1 rounded-xl bg-ink-700 text-paper-50 border border-ink-600 py-2"
              onClick={decline}
            >
              Decline
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
