-- BOLA TECH V14 schema. Safe to run many times (idempotent) and safe on top of a V13 database.

CREATE TABLE IF NOT EXISTS users(
 id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
 admin_id TEXT UNIQUE,
 password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'customer',
 phone TEXT, avatar_url TEXT, locale TEXT DEFAULT 'ar', created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS users_admin_id_uq ON users(admin_id) WHERE admin_id IS NOT NULL;
UPDATE users SET admin_id = 'BOLA-ADMIN-' || UPPER(SUBSTRING(MD5(id::text || email) FROM 1 FOR 8)) WHERE role='admin' AND admin_id IS NULL;

CREATE TABLE IF NOT EXISTS addresses(
 id BIGSERIAL PRIMARY KEY, user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
 label TEXT, full_name TEXT, phone TEXT, city TEXT, area TEXT, street TEXT, building TEXT,
 notes TEXT, is_default BOOLEAN DEFAULT false
);
CREATE TABLE IF NOT EXISTS products(
 id BIGSERIAL PRIMARY KEY, name_ar TEXT NOT NULL, name_en TEXT NOT NULL,
 slug TEXT UNIQUE NOT NULL, description_ar TEXT DEFAULT '', description_en TEXT DEFAULT '',
 category TEXT DEFAULT 'General', price NUMERIC(12,2) NOT NULL, old_price NUMERIC(12,2),
 stock INT NOT NULL DEFAULT 0, image_url TEXT, active BOOLEAN DEFAULT true,
 featured BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS services(
 id BIGSERIAL PRIMARY KEY, name_ar TEXT NOT NULL, name_en TEXT NOT NULL,
 slug TEXT UNIQUE NOT NULL, description_ar TEXT DEFAULT '', description_en TEXT DEFAULT '',
 category TEXT DEFAULT 'Services', price NUMERIC(12,2) NOT NULL, duration TEXT,
 image_url TEXT, active BOOLEAN DEFAULT true, featured BOOLEAN DEFAULT false,
 created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS carts(
 id BIGSERIAL PRIMARY KEY, user_id BIGINT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
 updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS cart_items(
 id BIGSERIAL PRIMARY KEY, cart_id BIGINT REFERENCES carts(id) ON DELETE CASCADE,
 product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
 service_id BIGINT REFERENCES services(id) ON DELETE CASCADE,
 quantity INT NOT NULL DEFAULT 1, CHECK ((product_id IS NOT NULL) <> (service_id IS NOT NULL))
);
CREATE TABLE IF NOT EXISTS orders(
 id BIGSERIAL PRIMARY KEY, user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
 status TEXT NOT NULL DEFAULT 'pending', payment_status TEXT NOT NULL DEFAULT 'unpaid',
 subtotal NUMERIC(12,2) NOT NULL, shipping NUMERIC(12,2) NOT NULL DEFAULT 0,
 total NUMERIC(12,2) NOT NULL, address_json JSONB, notes TEXT,
 created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS order_items(
 id BIGSERIAL PRIMARY KEY, order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
 product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
 service_id BIGINT REFERENCES services(id) ON DELETE SET NULL,
 title TEXT NOT NULL, quantity INT NOT NULL, unit_price NUMERIC(12,2) NOT NULL
);
CREATE TABLE IF NOT EXISTS wishlists(
 id BIGSERIAL PRIMARY KEY, user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
 product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
 UNIQUE(user_id,product_id)
);
CREATE TABLE IF NOT EXISTS reviews(
 id BIGSERIAL PRIMARY KEY, user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
 product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
 rating INT CHECK(rating BETWEEN 1 AND 5), body TEXT DEFAULT '',
 created_at TIMESTAMPTZ DEFAULT now(), UNIQUE(user_id,product_id)
);
CREATE TABLE IF NOT EXISTS audit_logs(
 id BIGSERIAL PRIMARY KEY, user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
 action TEXT NOT NULL, entity TEXT, entity_id TEXT, meta JSONB, created_at TIMESTAMPTZ DEFAULT now()
);

-- ───────── V14 additions (upgrade V13 in place) ─────────
ALTER TABLE orders      ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'cod';
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS title_en TEXT;

-- Old V13 carts could contain the same product twice. Merge duplicates, then forbid them.
UPDATE cart_items ci SET quantity = d.total
  FROM (SELECT MIN(id) AS keep_id, SUM(quantity)::int AS total
          FROM cart_items GROUP BY cart_id, product_id, service_id HAVING COUNT(*) > 1) d
 WHERE ci.id = d.keep_id;
DELETE FROM cart_items a USING cart_items b
 WHERE a.id > b.id AND a.cart_id = b.cart_id
   AND a.product_id IS NOT DISTINCT FROM b.product_id
   AND a.service_id IS NOT DISTINCT FROM b.service_id;

CREATE UNIQUE INDEX IF NOT EXISTS cart_items_cart_product_uq ON cart_items(cart_id, product_id) WHERE product_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS cart_items_cart_service_uq ON cart_items(cart_id, service_id) WHERE service_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS orders_user_idx        ON orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS orders_status_idx      ON orders(status);
CREATE INDEX IF NOT EXISTS order_items_order_idx  ON order_items(order_id);
CREATE INDEX IF NOT EXISTS order_items_prod_idx   ON order_items(product_id);
CREATE INDEX IF NOT EXISTS addresses_user_idx     ON addresses(user_id);
CREATE INDEX IF NOT EXISTS reviews_product_idx    ON reviews(product_id);
CREATE INDEX IF NOT EXISTS products_active_idx    ON products(active, featured DESC, created_at DESC);

-- Data-integrity rules (applied to both new installs and databases created by V13).
DO $$ BEGIN
  ALTER TABLE products ADD CONSTRAINT products_stock_nonneg CHECK (stock >= 0);
EXCEPTION WHEN duplicate_object OR check_violation THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE products ADD CONSTRAINT products_price_nonneg CHECK (price >= 0);
EXCEPTION WHEN duplicate_object OR check_violation THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE services ADD CONSTRAINT services_price_nonneg CHECK (price >= 0);
EXCEPTION WHEN duplicate_object OR check_violation THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE cart_items ADD CONSTRAINT cart_items_qty_positive CHECK (quantity >= 1);
EXCEPTION WHEN duplicate_object OR check_violation THEN NULL; END $$;

-- ───────── V15: departments, custom fields, media, inquiries, settings, account security ─────────
CREATE TABLE IF NOT EXISTS departments(
 id BIGSERIAL PRIMARY KEY, slug TEXT UNIQUE NOT NULL, name_ar TEXT NOT NULL, name_en TEXT NOT NULL,
 description_ar TEXT DEFAULT '', description_en TEXT DEFAULT '', icon TEXT NOT NULL DEFAULT 'box',
 purchase_mode TEXT NOT NULL DEFAULT 'cart', sort_order INT NOT NULL DEFAULT 0, active BOOLEAN NOT NULL DEFAULT true,
 created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS department_fields(
 id BIGSERIAL PRIMARY KEY, department_id BIGINT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
 key TEXT NOT NULL, label_ar TEXT NOT NULL, label_en TEXT NOT NULL, type TEXT NOT NULL DEFAULT 'text',
 options JSONB NOT NULL DEFAULT '[]', unit TEXT DEFAULT '', required BOOLEAN NOT NULL DEFAULT false,
 filterable BOOLEAN NOT NULL DEFAULT false, show_on_card BOOLEAN NOT NULL DEFAULT false,
 sort_order INT NOT NULL DEFAULT 0, active BOOLEAN NOT NULL DEFAULT true, UNIQUE(department_id, key)
);
ALTER TABLE products ADD COLUMN IF NOT EXISTS department_id BIGINT REFERENCES departments(id) ON DELETE SET NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS attributes JSONB NOT NULL DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS images JSONB NOT NULL DEFAULT '[]';
CREATE INDEX IF NOT EXISTS products_dept_idx ON products(department_id);

-- V14 databases: put every existing product in an "Electronics" department so nothing disappears.
INSERT INTO departments(slug,name_ar,name_en,icon,sort_order)
  SELECT 'electronics','إلكترونيات','Electronics','cpu',1 WHERE EXISTS (SELECT 1 FROM products WHERE department_id IS NULL)
  ON CONFLICT (slug) DO NOTHING;
UPDATE products SET department_id = (SELECT id FROM departments WHERE slug = 'electronics') WHERE department_id IS NULL AND EXISTS (SELECT 1 FROM departments WHERE slug = 'electronics');

-- Uploaded images live in the database (one backup covers everything, survives redeploys).
CREATE TABLE IF NOT EXISTS media(
 id BIGSERIAL PRIMARY KEY, mime TEXT NOT NULL, data BYTEA NOT NULL, size INT NOT NULL,
 created_by BIGINT REFERENCES users(id) ON DELETE SET NULL, created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS inquiries(
 id BIGSERIAL PRIMARY KEY, product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
 user_id BIGINT REFERENCES users(id) ON DELETE SET NULL, name TEXT NOT NULL, phone TEXT NOT NULL,
 message TEXT DEFAULT '', status TEXT NOT NULL DEFAULT 'new', created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS inquiries_status_idx ON inquiries(status, created_at DESC);
CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY, value JSONB NOT NULL);

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_logins INT NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_secret TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_enabled BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS recovery_codes JSONB NOT NULL DEFAULT '[]';
CREATE TABLE IF NOT EXISTS sessions(
 id TEXT PRIMARY KEY, user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 ip TEXT, user_agent TEXT, created_at TIMESTAMPTZ DEFAULT now(), last_seen TIMESTAMPTZ DEFAULT now(),
 expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id);

DO $$ BEGIN
  ALTER TABLE departments ADD CONSTRAINT departments_mode_ck CHECK (purchase_mode IN ('cart','inquiry'));
EXCEPTION WHEN duplicate_object OR check_violation THEN NULL; END $$;

-- V16: support tickets share the inquiries table (product_id stays NULL for them)
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'product';

-- ───────── V17: coupons, banners, manual payments, notifications ─────────
CREATE TABLE IF NOT EXISTS coupons(
 id BIGSERIAL PRIMARY KEY, code TEXT UNIQUE NOT NULL, type TEXT NOT NULL DEFAULT 'percent', value NUMERIC(12,2) NOT NULL,
 min_total NUMERIC(12,2) NOT NULL DEFAULT 0, max_discount NUMERIC(12,2), starts_at TIMESTAMPTZ, expires_at TIMESTAMPTZ,
 max_uses INT, used_count INT NOT NULL DEFAULT 0, per_user INT NOT NULL DEFAULT 1, active BOOLEAN NOT NULL DEFAULT true,
 created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS coupon_redemptions(
 id BIGSERIAL PRIMARY KEY, coupon_id BIGINT NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
 user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE, order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
 created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS coupon_red_idx ON coupon_redemptions(coupon_id, user_id);
ALTER TABLE carts  ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount NUMERIC(12,2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_ref TEXT;
CREATE TABLE IF NOT EXISTS banners(
 id BIGSERIAL PRIMARY KEY, title_ar TEXT NOT NULL DEFAULT '', title_en TEXT NOT NULL DEFAULT '',
 subtitle_ar TEXT NOT NULL DEFAULT '', subtitle_en TEXT NOT NULL DEFAULT '', image_url TEXT NOT NULL DEFAULT '',
 link_url TEXT NOT NULL DEFAULT '', button_ar TEXT NOT NULL DEFAULT '', button_en TEXT NOT NULL DEFAULT '',
 sort_order INT NOT NULL DEFAULT 0, active BOOLEAN NOT NULL DEFAULT true, created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS user_notifications(
 id BIGSERIAL PRIMARY KEY, user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE, kind TEXT NOT NULL DEFAULT 'info',
 title_ar TEXT NOT NULL, title_en TEXT NOT NULL DEFAULT '', body_ar TEXT NOT NULL DEFAULT '', body_en TEXT NOT NULL DEFAULT '',
 link TEXT NOT NULL DEFAULT '', is_read BOOLEAN NOT NULL DEFAULT false, created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS user_notif_idx ON user_notifications(user_id, is_read, id DESC);
DO $$ BEGIN
  ALTER TABLE coupons ADD CONSTRAINT coupons_type_ck CHECK (type IN ('percent','fixed'));
EXCEPTION WHEN duplicate_object OR check_violation THEN NULL; END $$;

-- Store admin passkeys (WebAuthn / Fingerprint / Face ID / Windows Hello)
CREATE TABLE IF NOT EXISTS edu_passkeys(
 id BIGSERIAL PRIMARY KEY, user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE, credential_id TEXT UNIQUE NOT NULL, public_key BYTEA NOT NULL, counter BIGINT NOT NULL DEFAULT 0, transports TEXT[] NOT NULL DEFAULT '{}', device_name TEXT NOT NULL DEFAULT 'هذا الجهاز', created_at TIMESTAMPTZ DEFAULT now(), last_used_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS edu_passkeys_user_idx ON edu_passkeys(user_id);
CREATE TABLE IF NOT EXISTS edu_passkey_challenges(
 user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, challenge TEXT NOT NULL, kind TEXT NOT NULL, expires_at TIMESTAMPTZ NOT NULL
);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS auth_method TEXT NOT NULL DEFAULT 'password';
