import { organization } from "better-auth/plugins"
import {Account, BetterAuthOptions} from "better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {db} from "~/server/db";
import {env} from "~/env";
import {connectOrganizationAccountWithNewAccount} from "~/server/services/organization-account";
import {getAndSaveOfflineToken} from "~/server/services/offline-token";
import {account} from "~/server/db/schema";
import {eq} from "drizzle-orm";



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
  databaseHooks: {
    account: {
      create: {
        after: async (acc: Account) => {
          try {
            await connectOrganizationAccountWithNewAccount(acc)
            if(acc.providerId == 'facebook') {
              await getAndSaveOfflineToken(acc)
            }
          }catch (error) {
            console.error(error)
            await db.delete(account).where(eq(account.id, acc.id))
          }

        }
      }
    }
  }
} satisfies BetterAuthOptions

export const auth = betterAuth(config);
export type Session = typeof auth.$Infer.Session

