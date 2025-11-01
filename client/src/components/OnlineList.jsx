import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import usePresence from "../hooks/usePresence";

const AVATAR = (name = "User") =>
  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
    name
  )}&backgroundType=gradientLinear&fontFamily=Helvetica`;

export default function OnlineList({
  onSelectUser,
  filterQuery = "",
  navigateOnClick = true,
}) {
  const navigate = useNavigate();
  const { online } = usePresence(); // [{ userId, name, status }, ...]

  const data = useMemo(() => {
    const q = (filterQuery || "").trim().toLowerCase();
    if (!q) return online;
    return online.filter((u) => (u?.name || "").toLowerCase().includes(q));
  }, [online, filterQuery]);

  if (!data?.length)
    return (
      <div className="p-4 text-sm text-paper-400">No one online yet.</div>
    );

  return (
    <div className="p-2 sm:p-3 space-y-1 sm:space-y-2 max-h-[70vh] overflow-y-auto">
      {data.map((u) => {
        const color =
          u.status === "busy"
            ? "text-red-400"
            : u.status === "away"
            ? "text-yellow-400"
            : "text-green-400";

        return (
          <button
            key={u.userId}
            onClick={() => {
              onSelectUser?.(u);
              if (navigateOnClick) navigate(`/chat/${u.userId}`);
            }}
            className="w-full flex items-center gap-3 rounded-xl border border-ink-700 bg-ink-800/50 hover:bg-ink-700/40 transition px-3 py-2.5"
            title={`${u.name || "User"} — ${u.status}`}
          >
            <img
              src={AVATAR(u.name)}
              alt={u.name || "User"}
              className="h-10 w-10 rounded-full border border-ink-600 bg-ink-700 object-cover"
            />
            <div className="min-w-0 flex-1 text-left">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium">{u.name || "User"}</span>
                <span className={`text-xs ${color}`}>● {u.status}</span>
              </div>
              <p className="truncate text-sm text-paper-400">
                Say hello 👋
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
