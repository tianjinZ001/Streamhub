"use client";

import { Icon } from "./Icons";
import { useToast } from "./Toast";

export function CopyInstallBox({ command }: { command: string }) {
  const toast = useToast();
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(command);
      toast("已复制安装命令");
    } catch {
      toast("复制失败，请手动选中复制");
    }
  }
  return (
    <div className="install-box">
      <span>$ {command}</span>
      <button onClick={handleCopy} type="button">
        <Icon id="copy" />
      </button>
    </div>
  );
}
