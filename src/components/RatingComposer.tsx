"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./Icons";
import { useToast } from "./Toast";
import { submitReview } from "@/app/(app)/assets/[id]/actions";

export function RatingComposer({ assetId }: { assetId: string }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();

  const display = hover || rating;

  function handleSubmit() {
    if (!rating) {
      toast("请先点击星星选择评分");
      return;
    }
    startTransition(async () => {
      const res = await submitReview(assetId, rating, text);
      if (res.ok) {
        toast("评分已提交，感谢你的反馈");
        setRating(0);
        setText("");
        router.refresh();
      } else {
        toast(res.message || "提交失败");
      }
    });
  }

  return (
    <div className="rate-box">
      <div className="rate-head">
        <span className="rate-label">点击星星打分</span>
        <div className="stars">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              className={`star-pick${i <= display ? " on" : ""}`}
              onMouseOver={() => setHover(i)}
              onMouseOut={() => setHover(0)}
              onClick={() => setRating(i)}
            >
              <Icon id={i <= display ? "star" : "star-o"} />
            </button>
          ))}
        </div>
        <span className={`rate-num${rating ? "" : " empty"}`}>{rating ? `${rating} 分` : "未评分"}</span>
      </div>
      <textarea
        className="review-text"
        placeholder="写下你的使用体验，帮助创作者迭代版本，亦可帮助同事判断是否适合自己…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="rate-actions">
        <button className="btn btn-primary" onClick={handleSubmit} disabled={pending}>
          {pending ? "提交中…" : "提交评价"}
        </button>
      </div>
    </div>
  );
}
