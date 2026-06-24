import Link from "next/link";
import { TypePicker } from "@/components/TypePicker";
import { TagSelect } from "@/components/TagSelect";
import { FileDropzone } from "@/components/FileDropzone";
import { SubmitButton } from "@/components/SubmitButton";
import { getAllTags } from "@/lib/queries";
import { DEPTS } from "@/lib/constants";
import { createAsset } from "./actions";

export default async function UploadPage() {
  const tags = await getAllTags();

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>分享一个资产</h1>
          <p>填写信息后会进入轻量审核，1 个工作日内自动发布。</p>
        </div>
      </div>

      <form className="form-wrap" action={createAsset}>
        <div className="form-group">
          <label>类型</label>
          <TypePicker defaultValue="skill" />
        </div>

        <div className="form-group">
          <label>名称</label>
          <input type="text" name="name" required placeholder="例如：PR 自动摘要生成器" />
        </div>

        <div className="form-group">
          <label>简介</label>
          <input type="text" name="description" required placeholder="一句话说清楚它解决什么问题" />
        </div>

        <div className="form-group">
          <label>所属部门</label>
          <select name="dept" required defaultValue="">
            <option value="" disabled>
              请选择
            </option>
            {DEPTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>标签（可多选）</label>
          <TagSelect tags={tags} />
        </div>

        <div className="form-group">
          <label>详细说明</label>
          <textarea
            name="detail_md"
            placeholder={"## 这个资产是做什么的\n\n## 如何使用\n\n## 注意事项"}
          />
          <div className="hint">支持 Markdown 格式</div>
          <div className="desc-upload-row">
            <span className="desc-upload-hint">可补充截图、效果图或现成文档（PDF / Word / Markdown），作为文字说明的补充</span>
          </div>
          <FileDropzone
            name="attachment_files"
            hint="支持图片 / PDF / Word / Markdown / TXT"
            accept="image/*,.pdf,.doc,.docx,.md,.txt"
          />
        </div>

        <div className="form-group">
          <label>
            文件 / 内容 <span style={{ color: "var(--danger)" }}>*</span>
          </label>
          <FileDropzone
            name="core_files"
            large
            hint="SKILL.md · mcp.json · agent 配置 —— 资产的核心内容"
          />
        </div>

        <div className="form-actions">
          <Link href="/home" className="btn">
            取消
          </Link>
          <SubmitButton>提交审核</SubmitButton>
        </div>
      </form>
    </div>
  );
}
