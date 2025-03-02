import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer, pgTable,
  pgTableCreator,
  primaryKey,
  text,
  timestamp, uuid,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `t3_test_app_${name}`);

export const posts = createTable(
  "post",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    name: varchar("name", { length: 256 }),
    createdById: varchar("created_by", { length: 255 })
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  },
  (example) => ({
    createdByIdIdx: index("created_by_idx").on(example.createdById),
    nameIndex: index("name_idx").on(example.name),
  })
);

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull()
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(()=> user.id),
  activeOrganizationId: text('active_organization_id')
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(()=> user.id),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull()
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at')
});

export const organization = pgTable("organization", {
  id: text("id").primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').unique(),
  logo: text('logo'),
  createdAt: timestamp('created_at').notNull(),
  metadata: text('metadata')
});

export const member = pgTable("member", {
  id: text("id").primaryKey(),
  organizationId: text('organization_id').notNull().references(()=> organization.id),
  userId: text('user_id').notNull().references(()=> user.id),
  role: text('role').notNull(),
  createdAt: timestamp('created_at').notNull()
});

export const invitation = pgTable("invitation", {
  id: text("id").primaryKey(),
  organizationId: text('organization_id').notNull().references(()=> organization.id),
  email: text('email').notNull(),
  role: text('role'),
  status: text('status').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  inviterId: text('inviter_id').notNull().references(()=> user.id)
});

export const organizationAccount = pgTable("organization_account", {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: text('organization_id').notNull().references(()=> organization.id),
  accountId: text('account_id').references(()=> account.id),
  createdAt: timestamp('created_at').notNull(),
  status: text('status'),
  ownerId: text('user_id').notNull().references(() => user.id),
})

export const accountOfflineToken = pgTable("account_offline_token", {
  id: uuid('id').defaultRandom().primaryKey(),
  accountId: text('account_id').notNull().references(() => account.id),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').notNull(),
})