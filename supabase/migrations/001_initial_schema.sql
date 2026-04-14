-- ============================================================
-- Il Mio Negozio — Schema iniziale
-- Esegui questo file nella SQL Editor di Supabase
-- ============================================================

-- ─── Extensions ───────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Tabelle ──────────────────────────────────────────────────────────────────

create table categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  created_at timestamptz default now()
);

create table products (
  id          uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete set null,
  name        text not null,
  slug        text not null unique,
  description text,
  price       numeric(10, 2) not null check (price >= 0),
  image_url   text,
  sizes       text[] not null default '{}',   -- ['XS','S','M','L','XL','XXL']
  colors      text[] not null default '{}',   -- ['Nero','Bianco','Rosso']
  gender      text not null default 'Unisex' check (gender in ('Uomo','Donna','Unisex')),
  stock       int not null default 0 check (stock >= 0),
  is_active   boolean not null default true,
  created_at  timestamptz default now()
);

create table orders (
  id               uuid primary key default gen_random_uuid(),
  customer_name    text not null,
  customer_email   text not null,
  customer_phone   text not null,
  shipping_address text not null,
  status           text not null default 'pending' check (status in ('pending','completed')),
  total_amount     numeric(10, 2) not null check (total_amount >= 0),
  created_at       timestamptz default now()
);

create table order_items (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid references orders(id) on delete cascade,
  product_id     uuid references products(id) on delete set null,
  product_name   text not null,    -- snapshot al momento dell'ordine
  product_price  numeric(10, 2) not null,
  selected_size  text,
  selected_color text,
  quantity       int not null check (quantity > 0)
);

-- ─── Indici ───────────────────────────────────────────────────────────────────
create index on products(category_id);
create index on products(is_active);
create index on products(gender);
create index on orders(status);
create index on orders(created_at desc);
create index on order_items(order_id);

-- ─── Row Level Security ───────────────────────────────────────────────────────
alter table categories  enable row level security;
alter table products    enable row level security;
alter table orders      enable row level security;
alter table order_items enable row level security;

-- Categorie: lettura pubblica, scrittura solo admin autenticati
create policy "categories_public_read"   on categories for select using (true);
create policy "categories_admin_write"   on categories for all    using (auth.role() = 'authenticated');

-- Prodotti: lettura pubblica (solo attivi), scrittura solo admin
create policy "products_public_read"     on products for select using (is_active = true);
create policy "products_admin_all"       on products for all    using (auth.role() = 'authenticated');

-- Ordini: inserimento anonimo (chiunque può ordinare), lettura/modifica solo admin
create policy "orders_anon_insert"       on orders for insert with check (true);
create policy "orders_admin_select"      on orders for select using (auth.role() = 'authenticated');
create policy "orders_admin_update"      on orders for update using (auth.role() = 'authenticated');

-- Order items: stessa logica degli ordini
create policy "order_items_anon_insert"  on order_items for insert with check (true);
create policy "order_items_admin_select" on order_items for select using (auth.role() = 'authenticated');

-- ─── Storage Bucket ───────────────────────────────────────────────────────────
-- Esegui nella sezione Storage di Supabase oppure via dashboard:
--
-- 1. Crea bucket "product-images" → Public: true
-- 2. Policy lettura pubblica (già attiva con bucket pubblico)
-- 3. Policy upload solo autenticati:
--
-- insert into storage.policies (bucket_id, name, definition) values (
--   'product-images',
--   'Authenticated users can upload',
--   '(auth.role() = ''authenticated'')'
-- );

-- ─── Dati di esempio (opzionale, rimuovi in produzione) ───────────────────────
insert into categories (name, slug) values
  ('T-Shirt', 't-shirt'),
  ('Felpe', 'felpe'),
  ('Pantaloni', 'pantaloni'),
  ('Giacche', 'giacche');
