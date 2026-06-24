export const DEPTS = ["前端团队", "后端团队", "数据团队", "设计团队", "测试团队", "产品团队"] as const;

export const TYPE_META = {
  skill: { label: "Skill", cls: "skill" },
  mcp: { label: "MCP", cls: "mcp" },
  agent: { label: "Agent", cls: "agent" },
} as const;

export type AssetType = keyof typeof TYPE_META;

export const DIM_KEYS = ["实用性", "文档清晰", "安装简单", "稳定好用"] as const;
