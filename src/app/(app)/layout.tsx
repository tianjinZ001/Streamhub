import { redirect } from "next/navigation";
import { Topbar } from "@/components/Topbar";
import { getCurrentProfile } from "@/lib/queries";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  // middleware 已经拦过未登录的情况，这里是双重保险（比如 profile 行还没建出来）
  if (!profile) redirect("/login");

  return (
    <>
      <Topbar userName={profile.name} dept={profile.dept} />
      {children}
    </>
  );
}
