"use client";

import { useEffect, useState } from "react";
import { Clock } from "./Clock";

function ListenerCount() {
  // No backend wired up — swap this for a real presence source
  // (e.g. a websocket room count) when one exists.
  const [count] = useState(() => 40 + Math.floor(Math.random() * 60));
  return (
    <span className="flex items-center gap-1.5 text-xs font-medium text-white/70">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_theme(colors.emerald.400)]" />
      {count} listening now
    </span>
  );
}

function SocialLinks() {
  const links = [
    { label: "X", href: "https://x.com" },
    { label: "IG", href: "https://instagram.com" },
  ];
  return (
    <div className="flex items-center gap-3 text-xs font-medium text-white/70">
      {links.map((l) => (
        <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className="transition hover:text-white">
          {l.label}
        </a>
      ))}
    </div>
  );
}

export function TopRow() {
  return (
    <div
      className="fixed left-0 right-0 top-0 z-10 flex items-center justify-between"
      style={{
        paddingTop: "max(1rem, env(safe-area-inset-top))",
        paddingLeft: "max(1rem, env(safe-area-inset-left))",
        paddingRight: "max(1rem, env(safe-area-inset-right))",
      }}
    >
      <Clock />
      <div className="absolute left-1/2 -translate-x-1/2">
        <ListenerCount />
      </div>
      <SocialLinks />
    </div>
  );
}
