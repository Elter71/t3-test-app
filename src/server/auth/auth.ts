import {oAuthProxy, organization} from "better-auth/plugins"
import type { BetterAuthOptions } from "better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {db} from "~/server/db";
import {env} from "~/env";


export const config = {
  database: drizzleAdapter(db, {
    provider: "pg"
  }),
  secret: env.AUTH_SECRET,
  baseURL: 'http://localhost:3000',
  plugins: [oAuthProxy(), organization()],
  socialProviders: {
    discord: {
      clientId: env.AUTH_DISCORD_ID,
      clientSecret: env.AUTH_DISCORD_SECRET
    }
  },
} satisfies BetterAuthOptions

export const auth = betterAuth(config);
export type Session = typeof auth.$Infer.Session