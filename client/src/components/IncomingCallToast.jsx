// src/components/IncomingCallToast.jsx
import React from "react";
import { useCall } from "../hooks/useCall";

const AVATAR = (name = "User") =>
  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
    name
  )}&backgroundType=gradientLinear&fontFamily=Helvetica`;

export default function IncomingCallToast({ onNavigate }) {
  const { state, remoteUser, incomingHasVideo, accept, decline } = useCall();

  if (state !== "incoming" || !remoteUser) return null;

  const name = remoteUser?.name || remoteUser?.userId || "Unknown";

  const onAccept = () => {
    accept();
    if (onNavigate) {
      onNavigate(`/call/${incomingHasVideo ? "video" : "audio"}/${remoteUser.userId}`);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[320px] rounded-2xl border border-ink-700 bg-ink-800/90 backdrop-blur shadow-xl p-4">
      <div className="flex items-center gap-3">
        <img
          src={AVATAR(name)}
          alt="caller"
          className="h-12 w-12 rounded-full border border-ink-600 bg-ink-700 object-cover"
        />
        <div className="min-w-0">
          <div className="font-medium truncate">{name}</div>
          <div className="text-xs text-paper-400">
            Incoming {incomingHasVideo ? "video" : "audio"} call
          </div>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          className="flex-1 rounded-xl bg-brand text-paper-50 py-2"
          onClick={onAccept}
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
  );
}
