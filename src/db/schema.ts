import { sql } from "drizzle-orm";
import {
  boolean,
  customType,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

export const adminRole = pgEnum("admin_role", ["owner", "editor"]);
export const publishStatus = pgEnum("publish_status", ["draft", "published"]);
export const inquiryStatus = pgEnum("inquiry_status", [
  "baru",
  "dihubungi",
  "penawaran_dikirim",
  "deal",
  "batal",
]);
export const syncStatus = pgEnum("sync_status", ["pending", "syncing", "synced", "failed", "disabled"]);
export const redirectEntity = pgEnum("redirect_entity", ["product", "portfolio", "category"]);

/* ---------- Auth ---------- */

export const adminUsers = pgTable("admin_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: adminRole("role").notNull().default("editor"),
  isActive: boolean("is_active").notNull().default(true),
  failedLoginCount: integer("failed_login_count").notNull().default(0),
  lockedUntil: timestamp("locked_until", { withTimezone: true }),
  passwordChangedAt: timestamp("password_changed_at", { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  ...timestamps,
});

export const sessions = pgTable(
  "sessions",
  {
    // SHA-256 of the session token. The raw token only lives in the cookie.
    id: text("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => adminUsers.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
    ipHash: text("ip_hash"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

/* ---------- Media ---------- */

export const media = pgTable("media", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  filename: text("filename").notNull(),
  mime: text("mime").notNull(),
  size: integer("size").notNull(),
  width: integer("width"),
  height: integer("height"),
  alt: text("alt").notNull().default(""),
  createdBy: uuid("created_by").references(() => adminUsers.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return "bytea";
  },
});

// Object bytes for STORAGE_DRIVER=db, used when no external object storage is configured.
export const mediaObjects = pgTable("media_objects", {
  key: text("key").primaryKey(),
  mime: text("mime").notNull(),
  body: bytea("body").notNull(),
});

/* ---------- Catalog ---------- */

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  tagline: text("tagline").notNull().default(""),
  description: text("description").notNull().default(""),
  coverMediaId: uuid("cover_media_id").references(() => media.id, { onDelete: "set null" }),
  sortOrder: integer("sort_order").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(true),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  ...timestamps,
});

export type SpecRow = { label: string; value: string };

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
    summary: text("summary").notNull().default(""),
    description: text("description").notNull().default(""),
    materials: text("materials").array().notNull().default(sql`'{}'::text[]`),
    techniques: text("techniques").array().notNull().default(sql`'{}'::text[]`),
    useCases: text("use_cases").array().notNull().default(sql`'{}'::text[]`),
    specs: jsonb("specs").$type<SpecRow[]>().notNull().default([]),
    status: publishStatus("status").notNull().default("draft"),
    isFeatured: boolean("is_featured").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    ogMediaId: uuid("og_media_id").references(() => media.id, { onDelete: "set null" }),
    noindex: boolean("noindex").notNull().default(false),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [index("products_category_idx").on(t.categoryId), index("products_status_idx").on(t.status)],
);

export const productImages = pgTable(
  "product_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    mediaId: uuid("media_id")
      .notNull()
      .references(() => media.id, { onDelete: "cascade" }),
    alt: text("alt").notNull().default(""),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("product_images_product_idx").on(t.productId)],
);

export const productVariants = pgTable(
  "product_variants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    detail: text("detail").notNull().default(""),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("product_variants_product_idx").on(t.productId)],
);

/* ---------- Portfolio ---------- */

export const portfolioProjects = pgTable(
  "portfolio_projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    clientName: text("client_name").notNull().default(""),
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
    productLabel: text("product_label").notNull().default(""),
    materials: text("materials").array().notNull().default(sql`'{}'::text[]`),
    techniques: text("techniques").array().notNull().default(sql`'{}'::text[]`),
    summary: text("summary").notNull().default(""),
    description: text("description").notNull().default(""),
    year: integer("year"),
    status: publishStatus("status").notNull().default("draft"),
    isFeatured: boolean("is_featured").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    noindex: boolean("noindex").notNull().default(false),
    ...timestamps,
  },
  (t) => [index("portfolio_category_idx").on(t.categoryId)],
);

export const portfolioImages = pgTable(
  "portfolio_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => portfolioProjects.id, { onDelete: "cascade" }),
    mediaId: uuid("media_id")
      .notNull()
      .references(() => media.id, { onDelete: "cascade" }),
    alt: text("alt").notNull().default(""),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("portfolio_images_project_idx").on(t.projectId)],
);

export const slugRedirects = pgTable(
  "slug_redirects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    entity: redirectEntity("entity").notNull(),
    fromSlug: text("from_slug").notNull(),
    toId: uuid("to_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("slug_redirects_entity_from_idx").on(t.entity, t.fromSlug)],
);

/* ---------- Content ---------- */

export const faqs = pgTable("faqs", {
  id: uuid("id").primaryKey().defaultRandom(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(true),
  ...timestamps,
});

export const clients = pgTable(
  "clients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    logoMediaId: uuid("logo_media_id").references(() => media.id, { onDelete: "set null" }),
    sortOrder: integer("sort_order").notNull().default(0),
    isPublished: boolean("is_published").notNull().default(true),
    ...timestamps,
  },
  (t) => [index("clients_sort_idx").on(t.sortOrder)],
);

export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  updatedBy: uuid("updated_by").references(() => adminUsers.id, { onDelete: "set null" }),
});

/* ---------- Inquiries ---------- */

export const inquiries = pgTable(
  "inquiries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ref: text("ref").notNull().unique(),
    name: text("name").notNull(),
    company: text("company").notNull().default(""),
    whatsapp: text("whatsapp").notNull(),
    email: text("email").notNull().default(""),
    productTypes: text("product_types").array().notNull().default(sql`'{}'::text[]`),
    quantity: text("quantity").notNull().default(""),
    material: text("material").notNull().default(""),
    finishing: text("finishing").array().notNull().default(sql`'{}'::text[]`),
    targetDate: text("target_date").notNull().default(""),
    notes: text("notes").notNull().default(""),
    sourcePath: text("source_path").notNull().default(""),
    status: inquiryStatus("status").notNull().default("baru"),
    adminNotes: text("admin_notes").notNull().default(""),
    sheetStatus: syncStatus("sheet_status").notNull().default("pending"),
    sheetAttempts: integer("sheet_attempts").notNull().default(0),
    sheetLastError: text("sheet_last_error"),
    sheetSyncedAt: timestamp("sheet_synced_at", { withTimezone: true }),
    sheetLockedAt: timestamp("sheet_locked_at", { withTimezone: true }),
    ipHash: text("ip_hash"),
    ...timestamps,
  },
  (t) => [
    index("inquiries_status_idx").on(t.status),
    index("inquiries_sheet_idx").on(t.sheetStatus),
    index("inquiries_created_idx").on(t.createdAt),
  ],
);

/* ---------- Security & audit ---------- */

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorId: uuid("actor_id").references(() => adminUsers.id, { onDelete: "set null" }),
    actorEmail: text("actor_email").notNull().default(""),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id"),
    summary: text("summary").notNull().default(""),
    ipHash: text("ip_hash"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("audit_created_idx").on(t.createdAt)],
);

export const securityEvents = pgTable(
  "security_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: text("type").notNull(),
    email: text("email"),
    userId: uuid("user_id").references(() => adminUsers.id, { onDelete: "set null" }),
    ipHash: text("ip_hash"),
    userAgent: text("user_agent"),
    detail: text("detail").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("security_events_created_idx").on(t.createdAt), index("security_events_type_idx").on(t.type)],
);

export const rateLimits = pgTable(
  "rate_limits",
  {
    bucket: text("bucket").notNull(),
    key: text("key").notNull(),
    windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
    count: integer("count").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.bucket, t.key] })],
);

export type AdminUser = typeof adminUsers.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type PortfolioProject = typeof portfolioProjects.$inferSelect;
export type Inquiry = typeof inquiries.$inferSelect;
export type Media = typeof media.$inferSelect;
export type Faq = typeof faqs.$inferSelect;
