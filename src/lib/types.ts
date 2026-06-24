import type { AssetType } from "./constants";

export type Profile = {
  id: string;
  name: string;
  dept: string;
  avatar_url: string | null;
  is_admin: boolean;
};

export type AssetCardData = {
  id: string;
  type: AssetType;
  name: string;
  dept: string;
  description: string;
  version: string;
  score: number;
  votes: number;
  uses: number;
  status: "pending" | "published" | "rejected";
  created_at: string;
  updated_at: string;
  tags: string[];
};

export type AssetDetail = AssetCardData & {
  detail_md: string | null;
  install_cmd: string | null;
  author: { id: string; name: string; dept: string };
  dims: Record<string, number>;
  versions: { version: string; note: string | null; created_at: string }[];
  reviews: {
    id: string;
    stars: number;
    text: string | null;
    created_at: string;
    reviewer: { name: string; dept: string };
  }[];
};
