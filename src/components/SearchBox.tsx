"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./Icons";

export function SearchBox() {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const active = document.activeElement;
      const isTyping = active && /input|textarea/i.test(active.tagName);
      if (e.key === "/" && !isTyping) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function onKeyDownInput(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      const q = (e.target as HTMLInputElement).value.trim();
      router.push(q ? `/browse?q=${encodeURIComponent(q)}` : "/browse");
    }
    if (e.key === "Escape") {
      (e.target as HTMLInputElement).value = "";
      inputRef.current?.blur();
    }
  }

  return (
    <div className="search-box">
      <Icon id="search" className="ic" style={{ color: "var(--fg-subtle)" }} />
      <input ref={inputRef} placeholder="搜索 Skill / MCP / Agent" onKeyDown={onKeyDownInput} />
      <span className="search-kbd">/</span>
    </div>
  );
}
