"use client";

import { useState } from "react";
import { TYPE_META } from "@/lib/constants";

const ORDER = ["skill", "mcp", "agent"] as const;
const DESC: Record<string, string> = {
  skill: "SKILL.md 技能包",
  mcp: "工具/数据源连接",
  agent: "预设 Agent / 提示词",
};

export function TypePicker({ defaultValue = "skill" }: { defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue);
  return (
    <div className="type-pick">
      {ORDER.map((t) => (
        <button key={t} type="button" className={value === t ? "active" : ""} onClick={() => setValue(t)}>
          <b>
            <span className={`type-dot ${t}`} />
            {TYPE_META[t].label}
          </b>
          <span>{DESC[t]}</span>
        </button>
      ))}
      <input type="hidden" name="type" value={value} />
    </div>
  );
}
