"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createAsset(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const type = String(formData.get("type") || "skill");
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const dept = String(formData.get("dept") || "");
  const detail_md = String(formData.get("detail_md") || "").trim();
  const tags = formData.getAll("tags").map(String);

  if (!name || !description || !dept) {
    // MVP 先用最直接的方式报错；生产环境建议改成 useFormState 把校验信息传回表单内联展示
    throw new Error("名称、简介、所属部门为必填项");
  }

  const { data: asset, error } = await supabase
    .from("assets")
    .insert({
      type,
      name,
      dept,
      description,
      detail_md: detail_md || null,
      author_id: user.id,
      status: "pending",
      version: "v1.0",
    })
    .select("id")
    .single();
  if (error || !asset) {
    throw new Error("创建失败：" + (error?.message ?? "未知错误"));
  }

  if (tags.length) {
    const { data: tagRows } = await supabase.from("tags").select("id, name").in("name", tags);
    const links = (tagRows ?? []).map((t: any) => ({ asset_id: asset.id, tag_id: t.id }));
    if (links.length) await supabase.from("asset_tags").insert(links);
  }

  await supabase.from("asset_versions").insert({
    asset_id: asset.id,
    version: "v1.0",
    note: "首次发布",
  });

  const coreFiles = formData.getAll("core_files").filter((f): f is File => f instanceof File && f.size > 0);
  const attachFiles = formData
    .getAll("attachment_files")
    .filter((f): f is File => f instanceof File && f.size > 0);

  async function uploadOne(file: File, kind: "core" | "attachment") {
    const safeName = file.name.replace(/[^\w.\-\u4e00-\u9fa5]/g, "_");
    const path = `${asset!.id}/${kind}/${Date.now()}-${safeName}`;
    const { error: upErr } = await supabase.storage.from("asset-files").upload(path, file, {
      contentType: file.type || undefined,
    });
    if (upErr) {
      console.error("文件上传失败：", file.name, upErr.message);
      return; // 单个文件失败不阻塞整体提交；生产环境建议把失败结果回传给用户
    }
    await supabase.from("asset_files").insert({
      asset_id: asset!.id,
      kind,
      storage_path: path,
      filename: file.name,
      mime: file.type || null,
    });
  }

  await Promise.all([
    ...coreFiles.map((f) => uploadOne(f, "core")),
    ...attachFiles.map((f) => uploadOne(f, "attachment")),
  ]);

  revalidatePath("/profile");
  revalidatePath("/browse");
  redirect("/profile");
}
