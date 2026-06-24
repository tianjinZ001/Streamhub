"use client";

import { useState } from "react";

export function TagSelect({ tags }: { tags: string[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  function toggle(t: string) {
    setSelected((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]));
  }
  return (
    <div className="tag-select">
      {tags.map((t) => (
        <label key={t} className={`tag-opt${selected.includes(t) ? " active" : ""}`}>
          <input
            type="checkbox"
            name="tags"
            value={t}
            checked={selected.includes(t)}
            onChange={() => toggle(t)}
            style={{ display: "none" }}
          />
          {t}
        </label>
      ))}
    </div>
  );
}
