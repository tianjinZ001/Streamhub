import type { Metadata } from "next";
import { IconSprite } from "@/components/Icons";
import { ToastProvider } from "@/components/Toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "StreamHub · 内部 AI 能力库",
  description: "Streamax 内部 AI 能力库 —— 沉淀、发现、评价大家的 Skill / MCP / Agent。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <IconSprite />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
