import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PhoneOff, Mic, MicOff, Volume2, MoreHorizontal, ChevronLeft } from "lucide-react";
import useCall from "../hooks/useCall";
import useSystemState from "../hooks/useSystemState";

const AVATAR = (name = "User") =>
  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
    name
  )}&backgroundType=gradientLinear&fontFamily=Helvetica`;

export default function AudioCall() {
  const { id } = useParams();                 // target userId
  const navigate = useNavigate();
  const { running } = useSystemState();

  const {
    state, remoteUser,
    callAudio, accept, hangup,
    toggleMute
  } = useCall(null);

  const [muted, setMuted] = useState(false);

  const title = useMemo(
    () => remoteUser?.name || remoteUser?.userId || id,
    [remoteUser, id]
  );

  // When page mounts:
  // - if there's an incoming offer → accept it
  // - else if idle → start an outbound audio call to :id
  useEffect(() => {
    if (!running) return;
    if (state === "incoming") {
      accept();
    } else if (state === "idle" && id) {
      callAudio({ userId: id });
    }
  }, [state, id, running, accept, callAudio]);

  // cleanup: hang up when leaving this page
  useEffect(() => () => { if (state !== "idle") hangup(); }, [state, hangup]);

  return (
    <div className="min-h-screen bg-ink-900 text-paper-50 relative">
      {/* subtle pattern header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-ink-700 bg-ink-800/60 backdrop-blur">
        <button
          className="inline-flex items-center gap-2 text-paper-300 hover:text-paper-50"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="h-5 w-5" />
          Back
        </button>
        <div className="text-center">
          <div className="font-medium">{title}</div>
          <div className="text-xs text-paper-400">
            {state === "connecting" ? "Ringing…" :
             state === "active" ? "On call" :
             state}
          </div>
        </div>
        <MoreHorizontal className="h-5 w-5 opacity-0" /> {/* spacer */}
      </header>

      {/* avatar */}
      <main className="px-4 pt-10 flex flex-col items-center">
        <img
          src={AVATAR(title)}
          alt={title}
          className="h-40 w-40 rounded-full border border-ink-700 bg-ink-800 object-cover shadow-elev-2"
        />
      </main>

      {/* controls */}
      <div className="fixed left-1/2 -translate-x-1/2 bottom-8 w-[min(680px,92vw)]">
        <div className="rounded-2xl bg-ink-800/80 border border-ink-700 px-4 py-3 grid grid-cols-4 gap-3">
          <button className="rounded-xl bg-ink-700 text-paper-50 border border-ink-600 py-3">
            <Volume2 className="mx-auto h-5 w-5" />
          </button>
          <button
            className="rounded-xl bg-ink-700 text-paper-50 border border-ink-600 py-3"
            onClick={() => { const next = !muted; setMuted(next); toggleMute(next); }}
          >
            {muted ? <MicOff className="mx-auto h-5 w-5" /> : <Mic className="mx-auto h-5 w-5" />}
          </button>
          <div />
          <button
            className="rounded-xl bg-brand text-paper-50 py-3"
            onClick={() => { hangup(); navigate(-1); }}
          >
            <PhoneOff className="mx-auto h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
