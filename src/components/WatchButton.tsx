"use client";

import { Icon } from "./Icons";
import { useToast } from "./Toast";

/**
 * TODO：README 的数据模型里没有定义「关注/订阅」表，这里先做 UI 占位（仅 toast 提示）。
 * 真正要做的话，加一张 `watches(user_id, asset_id)` 表 + 一个定时/触发器在资产更新版本时发通知即可，
 * 结构可以完全照搬 favorites 表。
 */
export function WatchButton() {
  const toast = useToast();
  return (
    <button className="btn" style={{ flex: 1, justifyContent: "center" }} onClick={() => toast("已关注该资产的更新")}>
      <Icon id="eye" />
      关注
    </button>
  );
}
