import {oAuthProxy, organization} from "better-auth/plugins"
import {Account, BetterAuthOptions} from "better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {db} from "~/server/db";
import {env} from "~/env";
import {createAuthMiddleware} from "better-auth/api";
import {organizationAccount} from "~/server/db/schema";
import {OrganizationStatus} from "~/server/db/organization-account-status";
import {eq} from "drizzle-orm";
import {connectOrganizationAccountWithNewAccount} from "~/server/services/organization-account";



export const config = {
  database: drizzleAdapter(db, {
    provider: "pg"
  }),
  account: {
    accountLinking: {
      allowDifferentEmails: true
    }
  },
  secret: env.AUTH_SECRET,
  baseURL: 'http://localhost:3000',
  plugins: [organization()],
  socialProviders: {
    discord: {
      clientId: env.AUTH_DISCORD_ID,
      clientSecret: env.AUTH_DISCORD_SECRET
    },
    facebook: {
      clientId: env.FACEBOOK_CLIENT_ID,
      clientSecret: env.FACEBOOK_CLIENT_SECRET,
      scope: [
        'public_profile',
        'email',
        'business_management',
        'pages_read_engagement',
        'pages_show_list',
        'pages_read_user_content',
      ],
      redirectURI:  'http://localhost:3000/api/auth/callback/facebook'
    }
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      console.log("Before");
      console.log({path: ctx.path, body: ctx.body, params: ctx.params});
    }),

    after: createAuthMiddleware(async (ctx) => {
      console.log("After");

    }),

  },
  databaseHooks: {
    account: {
      create: {
        after: async (account: Account) => {
          await connectOrganizationAccountWithNewAccount(account)
        }
      }
    }
  }
} satisfies BetterAuthOptions

export const auth = betterAuth(config);
export type Session = typeof auth.$Infer.Session

