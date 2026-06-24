"use client";

import { useState, useTransition } from "react";
import { Icon } from "./Icons";
import { useToast } from "./Toast";
import { toggleFavorite } from "@/app/(app)/assets/[id]/actions";

export function FavoriteButton({
  assetId,
  initialFavorited,
}: {
  assetId: string;
  initialFavorited: boolean;
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  function handleClick() {
    startTransition(async () => {
      const res = await toggleFavorite(assetId);
      if (res.ok) {
        setFavorited(!!res.favorited);
        toast(res.favorited ? "已加入收藏" : "已取消收藏");
      } else {
        toast(res.message || "操作失败");
      }
    });
  }

  return (
    <button
      className="btn"
      disabled={pending}
      onClick={handleClick}
      style={{
        flex: 1,
        justifyContent: "center",
        ...(favorited
          ? { background: "var(--accent-subtle)", borderColor: "var(--accent)", color: "var(--accent)" }
          : {}),
      }}
    >
      <Icon id={favorited ? "bookmark" : "bookmark-o"} />
      {favorited ? "已收藏" : "收藏"}
    </button>
  );
}
