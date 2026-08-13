"use client";

import { useEffect, useState } from "react";

const formatter = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

export function Clock() {
  const [now, setNow] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setNow(formatter.format(new Date()));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) return <span className="text-sm font-medium text-white/80">&nbsp;</span>;

  const [time, meridiem] = now.split(" ");
  const [h, m] = time.split(":");

  return (
    <span className="text-sm font-medium tabular-nums text-white/80">
      {h}
      <span style={{ animation: "blink 1s step-start infinite" }}>:</span>
      {m} {meridiem}
    </span>
  );
}
