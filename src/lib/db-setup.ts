import { db } from "@/db";
import { sql } from "drizzle-orm";
import { products, settings, admins } from "@/db/schema";
import { hashPassword } from "./crypto";

const DDL = `
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  mobile_number varchar(10) NOT NULL UNIQUE,
  country_code varchar(5) NOT NULL DEFAULT '+91',
  password_hash text NOT NULL,
  mobile_verified boolean NOT NULL DEFAULT false,
  account_status varchar(20) NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  last_login timestamptz
);
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username varchar(60) NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role varchar(20) NOT NULL DEFAULT 'admin',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  product_code varchar(20) NOT NULL UNIQUE,
  name varchar(200) NOT NULL,
  description text NOT NULL DEFAULT '',
  price integer NOT NULL,
  mrp integer,
  image_url text,
  category varchar(100),
  stock_quantity integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  is_bestseller boolean NOT NULL DEFAULT false,
  is_archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number varchar(20) NOT NULL UNIQUE,
  customer_id integer,
  customer_name varchar(120) NOT NULL,
  customer_mobile varchar(10) NOT NULL,
  address_line text NOT NULL,
  city varchar(80) NOT NULL,
  state varchar(80) NOT NULL,
  pincode varchar(6) NOT NULL,
  subtotal integer NOT NULL,
  shipping_charge integer NOT NULL DEFAULT 0,
  order_total integer NOT NULL,
  payment_status varchar(30) NOT NULL DEFAULT 'pending',
  order_status varchar(30) NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_ref varchar(80);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount integer NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code varchar(30);
CREATE INDEX IF NOT EXISTS orders_customer_idx ON orders (customer_id);
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id integer NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id integer,
  product_name_snapshot varchar(200) NOT NULL,
  product_code_snapshot varchar(20) NOT NULL,
  unit_price_snapshot integer NOT NULL,
  quantity integer NOT NULL
);
CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items (order_id);
CREATE TABLE IF NOT EXISTS hero_slides (
  id SERIAL PRIMARY KEY,
  media_url text NOT NULL,
  media_type varchar(10) NOT NULL DEFAULT 'image',
  sort_order integer NOT NULL DEFAULT 0,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS reels (
  id SERIAL PRIMARY KEY,
  video_url text NOT NULL,
  caption varchar(200) NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS testimonials (
  id SERIAL PRIMARY KEY,
  customer_name varchar(120) NOT NULL,
  message text NOT NULL,
  rating integer NOT NULL DEFAULT 5,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS settings (
  key varchar(100) PRIMARY KEY,
  value text NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  token_hash varchar(64) NOT NULL UNIQUE,
  user_type varchar(10) NOT NULL,
  user_id integer NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sessions_token_idx ON sessions (token_hash);
`;

const SEED_PRODUCTS: {
  code: string;
  name: string;
  price: number;
  category: string;
  description: string;
  stock: number;
  featured?: boolean;
  bestseller?: boolean;
}[] = [
  { code: "BAD1", name: "Classic White Oxford Shirt", price: 899, category: "Shirts", description: "A crisp cotton Oxford shirt with a tailored fit. Easy to dress up for work or down with jeans.", stock: 30, bestseller: true },
  { code: "BAD2", name: "Slim Fit Blue Denim Jeans", price: 1499, category: "Jeans", description: "Stretch denim jeans with a clean slim fit and a classic mid-blue wash. Comfortable all day.", stock: 25, featured: true, bestseller: true },
  { code: "BAD3", name: "Embroidered Cotton Kurta", price: 1199, category: "Kurtas", description: "Soft cotton kurta with fine thread embroidery at the neckline. Light, breathable and perfect for everyday wear.", stock: 22, bestseller: true },
  { code: "BAD4", name: "Oversized Graphic T-Shirt", price: 699, category: "T-Shirts", description: "Drop-shoulder oversized tee in heavy cotton with a bold back graphic. A street-style staple.", stock: 40, bestseller: true },
  { code: "BAD5", name: "Black Cargo Joggers", price: 1299, category: "Joggers", description: "Relaxed cargo joggers with utility pockets and an elastic cuff. Built for comfort on the move.", stock: 28 },
  { code: "BAD6", name: "Floral Print Anarkali Kurta", price: 1799, category: "Kurtas", description: "Flowing Anarkali kurta in a soft floral print with a flared hem. A graceful pick for festive days.", stock: 18, featured: true },
  { code: "BAD7", name: "Wireless Earbuds Pro", price: 1999, category: "Gadgets", description: "True wireless earbuds with active noise cancellation, deep bass and a charging case for up to 24 hours of playtime.", stock: 35, featured: true, bestseller: true },
  { code: "BAD8", name: "Smart Fitness Watch", price: 2499, category: "Gadgets", description: "AMOLED smartwatch with heart-rate and sleep tracking, 100+ sport modes and a week-long battery.", stock: 20, featured: true, bestseller: true },
  { code: "BAD9", name: "Fleece Zip Hoodie", price: 1299, category: "Hoodies", description: "Warm brushed-fleece zip hoodie with a kangaroo pocket. Soft, cosy and easy to layer.", stock: 26 },
  { code: "BAD10", name: "Linen Casual Shirt", price: 1099, category: "Shirts", description: "Breathable linen-blend shirt with a relaxed fit. Ideal for warm days and weekend outings.", stock: 24 },
  { code: "BAD11", name: "High Waist Mom Jeans", price: 1599, category: "Jeans", description: "Vintage-style high waist jeans with a relaxed leg and a flattering fit. A modern classic.", stock: 20, bestseller: true },
  { code: "BAD12", name: "Portable Bluetooth Speaker", price: 1499, category: "Gadgets", description: "Water-resistant Bluetooth speaker with punchy sound, 12-hour battery and a built-in mic.", stock: 30 },
  { code: "BAD13", name: "Silk Blend Festive Kurta Set", price: 2299, category: "Kurtas", description: "Kurta, pants and dupatta set in a silk blend with subtle zari detailing. Made for celebrations.", stock: 12, featured: true },
  { code: "BAD14", name: "Quilted Puffer Jacket", price: 2799, category: "Jackets", description: "Lightweight quilted puffer jacket with a stand collar and zip pockets. Warm without the bulk.", stock: 14 },
  { code: "BAD15", name: "White Canvas Sneakers", price: 1799, category: "Footwear", description: "Clean low-top canvas sneakers with a cushioned insole and durable rubber sole. Goes with everything.", stock: 32, bestseller: true },
];

const SETTING_DEFAULTS: Record<string, string> = {
  store_name: "Beingaseller",
  tagline: "Trending fashion, gadgets & lifestyle",
  about:
    "Beingaseller is a premium online store for everything in trend: clothing, gadgets and lifestyle picks, curated with care and delivered across India.",
  whatsapp_number: "",
  contact_mobile: "",
  contact_email: "",
  instagram_url: "",
  shipping_charge: "50",
  business_address: "",
  announcement: "Handcrafted with love • Festive décor & gifting",
  shipping_policy:
    "Orders are processed within 2-4 business days. Each piece is handcrafted, so please allow a little extra time during festive season. Delivery timelines depend on your location (typically 4-8 business days after dispatch). Shipping charges are calculated at checkout.",
  return_policy:
    "As our products are handcrafted and made to order, returns are accepted only for items damaged in transit. Please share an unboxing video and photos within 48 hours of delivery on WhatsApp, and we will arrange a replacement or refund.",
  privacy_policy:
    "We collect only the information needed to fulfil your order (name, mobile number and delivery address). Your data is stored securely, never sold or shared with third parties, and passwords are stored only in securely hashed form.",
  terms:
    "By using this website you agree to our ordering, payment and delivery processes. Product colours may vary slightly as every piece is handcrafted. Prices are subject to change without notice; the price confirmed at checkout applies to your order.",
};

async function setup() {
  await db.execute(sql.raw(DDL));

  // Seed default admin (credentials are changed from Admin Settings)
  const adminUser = process.env.ADMIN_USERNAME || "admin";
  const adminPass = process.env.ADMIN_PASSWORD || "Admin@12345";
  await db
    .insert(admins)
    .values({ username: adminUser, passwordHash: hashPassword(adminPass), role: "admin" })
    .onConflictDoNothing();

  // Seed settings defaults
  for (const [key, value] of Object.entries(SETTING_DEFAULTS)) {
    await db.insert(settings).values({ key, value }).onConflictDoNothing();
  }

  // Seed product catalogue
  for (const p of SEED_PRODUCTS) {
    await db
      .insert(products)
      .values({
        productCode: p.code,
        name: p.name,
        description: p.description,
        price: p.price,
        category: p.category,
        stockQuantity: p.stock,
        isFeatured: !!p.featured,
        isBestseller: !!p.bestseller,
      })
      .onConflictDoNothing();
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __sscDbReady: Promise<void> | undefined;
}

export function ensureDb(): Promise<void> {
  if (!globalThis.__sscDbReady) {
    globalThis.__sscDbReady = setup().catch((err) => {
      globalThis.__sscDbReady = undefined;
      throw err;
    });
  }
  return globalThis.__sscDbReady;
}
