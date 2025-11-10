import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Radio, LogOut, Search } from "lucide-react";
import OnlineList from "../components/OnlineList";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-ink-900 text-paper-50">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-ink-700 bg-ink-900/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 grid grid-cols-1 gap-3 md:grid-cols-[auto_1fr_auto] md:items-center">
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-brand" />
            <span className="font-semibold tracking-tight">OfflineOrbit</span>
          </div>

          {/* global search */}
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-paper-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search or start a new chat"
              className="w-full rounded-xl bg-ink-800/70 border border-ink-600 pl-9 pr-3 py-2.5 text-sm text-paper-50 placeholder:text-paper-400 focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          <div className="md:justify-self-end">
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-3 py-2 text-sm font-medium text-paper-50 hover:bg-brand-600 transition"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Body: user list */}
      <main className="mx-auto max-w-6xl px-4 py-4">
        <section className="rounded-2xl border border-ink-700 bg-ink-800/60 backdrop-blur">
          <div className="px-4 py-3 border-b border-ink-700">
            <h2 className="font-semibold">Chats</h2>
          </div>
          
          <OnlineList filterQuery={q} navigateOnClick />
        </section>
      </main>
       
    </div>
  );
};

export default UserDashboard;
