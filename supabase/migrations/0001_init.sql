-- ============================================================
-- StreamHub / 流枢 —— 初始数据库结构
-- 在 Supabase Dashboard > SQL Editor 中执行，或用 supabase CLI:
--   supabase db push
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- profiles：由 SSO 登录自动同步 ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  dept text not null default '未分组',
  avatar_url text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- 新用户首次通过 SSO 登录时，自动建一条 profile
-- name / dept 取自 SSO 身份源返回的 user_metadata（需要在 SSO Provider 配置里映射）
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name, dept)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'full_name',
      new.email,
      '访客' || substr(new.id::text, 1, 4)  -- 匿名登录没有邮箱/姓名时的兜底（演示模式用）
    ),
    coalesce(new.raw_user_meta_data->>'dept', '未分组')
  )
  on conflict (id) do nothing;
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- tags ----------
create table public.tags (
  id serial primary key,
  name text unique not null
);
insert into public.tags (name) values
  ('代码审查'),('文档写作'),('数据分析'),('设计辅助'),('测试'),('DevOps'),('效率工具'),('UI开发');

-- ---------- assets ----------
create table public.assets (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('skill','mcp','agent')),
  name text not null,
  dept text not null,
  description text not null,
  detail_md text,
  install_cmd text,
  version text not null default 'v1.0',
  score numeric(3,2) not null default 0,
  votes int not null default 0,
  uses int not null default 0,
  status text not null default 'pending' check (status in ('pending','published','rejected')),
  author_id uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index assets_status_idx on public.assets(status);
create index assets_type_idx on public.assets(type);
create index assets_dept_idx on public.assets(dept);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
create trigger trg_assets_updated_at before update on public.assets
  for each row execute procedure public.set_updated_at();

-- ---------- asset_tags（多对多） ----------
create table public.asset_tags (
  asset_id uuid references public.assets(id) on delete cascade,
  tag_id int references public.tags(id) on delete cascade,
  primary key (asset_id, tag_id)
);

-- ---------- asset_dims：评分维度（实用性/文档清晰/安装简单/稳定好用） ----------
create table public.asset_dims (
  asset_id uuid references public.assets(id) on delete cascade,
  key text not null,
  value int not null check (value between 0 and 100),
  primary key (asset_id, key)
);

-- ---------- asset_files：核心文件 + 说明附件 ----------
create table public.asset_files (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid references public.assets(id) on delete cascade,
  kind text not null check (kind in ('core','attachment')),
  storage_path text not null,   -- Supabase Storage 中的路径
  filename text not null,
  mime text,
  created_at timestamptz not null default now()
);

-- ---------- asset_versions：版本历史 ----------
create table public.asset_versions (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid references public.assets(id) on delete cascade,
  version text not null,
  note text,
  created_at timestamptz not null default now()
);

-- ---------- reviews：评分 + 评价（每人每资产仅一条，重复提交即更新） ----------
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  stars int not null check (stars between 1 and 5),
  text text,
  created_at timestamptz not null default now(),
  unique (asset_id, user_id)
);

-- 评分变化时，自动重算 assets.score / votes
create or replace function public.recalc_asset_score()
returns trigger language plpgsql security definer as $$
declare target_id uuid := coalesce(new.asset_id, old.asset_id);
begin
  update public.assets a
  set score = coalesce((select round(avg(stars)::numeric,2) from public.reviews where asset_id = target_id),0),
      votes = (select count(*) from public.reviews where asset_id = target_id)
  where a.id = target_id;
  return coalesce(new, old);
end; $$;

create trigger trg_recalc_score
  after insert or update or delete on public.reviews
  for each row execute procedure public.recalc_asset_score();

-- ---------- favorites ----------
create table public.favorites (
  user_id uuid references public.profiles(id) on delete cascade,
  asset_id uuid references public.assets(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, asset_id)
);

-- ---------- 贡献榜：发布资产 + 收到评价的轻量加权（按需调整权重） ----------
create or replace view public.contributor_leaderboard as
select
  p.id as user_id,
  p.name,
  p.dept,
  coalesce(count(distinct a.id) filter (where a.status = 'published'), 0) * 10
    + coalesce((select count(*) from public.reviews r join public.assets a2 on a2.id = r.asset_id
                where a2.author_id = p.id), 0) * 2
    as contribution_score,
  count(distinct a.id) filter (where a.status = 'published') as assets_published
from public.profiles p
left join public.assets a on a.author_id = p.id
group by p.id, p.name, p.dept;

-- ---------- 公开统计（给未登录的 Landing 页用，security definer 绕过 RLS，只返回聚合数字） ----------
create or replace function public.get_public_stats()
returns table(asset_count bigint, contributor_count bigint, total_votes bigint, avg_score numeric)
language sql security definer as $$
  select
    (select count(*) from public.assets where status = 'published'),
    (select count(distinct author_id) from public.assets where status = 'published'),
    (select coalesce(sum(votes), 0) from public.assets where status = 'published'),
    (select coalesce(round(sum(score * votes) / greatest(sum(votes), 1)::numeric, 1), 0)
       from public.assets where status = 'published');
$$;
grant execute on function public.get_public_stats() to anon, authenticated;

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles enable row level security;
alter table public.assets enable row level security;
alter table public.asset_tags enable row level security;
alter table public.asset_dims enable row level security;
alter table public.asset_files enable row level security;
alter table public.asset_versions enable row level security;
alter table public.reviews enable row level security;
alter table public.favorites enable row level security;
alter table public.tags enable row level security;

-- profiles：内部全员可见姓名/部门（用于展示作者/评论者），只能改自己的
create policy "profiles_select_all" on public.profiles for select to authenticated using (true);
create policy "profiles_update_own" on public.profiles for update to authenticated using (id = auth.uid());

-- tags：全员可读
create policy "tags_select_all" on public.tags for select to authenticated using (true);

-- assets：已发布的对全员可见；待审核/被拒的只有作者本人和管理员可见
create policy "assets_select" on public.assets for select to authenticated
  using (status = 'published' or author_id = auth.uid()
         or exists (select 1 from public.profiles where id = auth.uid() and is_admin));
create policy "assets_insert_own" on public.assets for insert to authenticated
  with check (author_id = auth.uid());
create policy "assets_update_own_or_admin" on public.assets for update to authenticated
  using (author_id = auth.uid() or exists (select 1 from public.profiles where id = auth.uid() and is_admin));

-- asset_tags / asset_dims / asset_files / asset_versions：跟随所属 asset 的可见性
create policy "asset_tags_select" on public.asset_tags for select to authenticated
  using (exists (select 1 from public.assets a where a.id = asset_id
                 and (a.status='published' or a.author_id=auth.uid())));
create policy "asset_tags_write_own" on public.asset_tags for all to authenticated
  using (exists (select 1 from public.assets a where a.id = asset_id and a.author_id = auth.uid()));

create policy "asset_dims_select" on public.asset_dims for select to authenticated
  using (exists (select 1 from public.assets a where a.id = asset_id
                 and (a.status='published' or a.author_id=auth.uid())));
create policy "asset_dims_write_own" on public.asset_dims for all to authenticated
  using (exists (select 1 from public.assets a where a.id = asset_id and a.author_id = auth.uid()));

create policy "asset_files_select" on public.asset_files for select to authenticated
  using (exists (select 1 from public.assets a where a.id = asset_id
                 and (a.status='published' or a.author_id=auth.uid())));
create policy "asset_files_write_own" on public.asset_files for all to authenticated
  using (exists (select 1 from public.assets a where a.id = asset_id and a.author_id = auth.uid()));

create policy "asset_versions_select" on public.asset_versions for select to authenticated
  using (exists (select 1 from public.assets a where a.id = asset_id
                 and (a.status='published' or a.author_id=auth.uid())));
create policy "asset_versions_write_own" on public.asset_versions for all to authenticated
  using (exists (select 1 from public.assets a where a.id = asset_id and a.author_id = auth.uid()));

-- reviews：已发布资产的评价全员可读；只能写自己的
create policy "reviews_select" on public.reviews for select to authenticated
  using (exists (select 1 from public.assets a where a.id = asset_id and a.status='published'));
create policy "reviews_upsert_own" on public.reviews for insert to authenticated
  with check (user_id = auth.uid());
create policy "reviews_update_own" on public.reviews for update to authenticated
  using (user_id = auth.uid());

-- favorites：只能看到/操作自己的收藏
create policy "favorites_own" on public.favorites for all to authenticated
  using (user_id = auth.uid());

-- ============================================================
-- Storage：核心文件 + 说明附件用同一个 bucket，路径里区分 kind
-- 在 Dashboard > Storage 建一个名为 asset-files 的 **私有** bucket，
-- 然后执行下面的 policy（也可以在 Dashboard 里用 UI 配置）
-- ============================================================
insert into storage.buckets (id, name, public)
values ('asset-files', 'asset-files', false)
on conflict (id) do nothing;

create policy "asset_files_storage_read" on storage.objects for select to authenticated
  using (bucket_id = 'asset-files');
create policy "asset_files_storage_write" on storage.objects for insert to authenticated
  with check (bucket_id = 'asset-files');
