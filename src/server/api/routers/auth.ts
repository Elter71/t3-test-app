import {TRPCError, TRPCRouterRecord} from "@trpc/server";
import { protectedProcedure, publicProcedure } from "../trpc";
import {auth} from "~/server/auth";
import {z} from "zod";
import {organizationAccount} from "~/server/db/schema";
import {OrganizationStatus} from "~/server/db/organization-account-status";
import {eq} from "drizzle-orm";

export const authRouter = {
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),
  getSecretMessage: protectedProcedure.query(() => {
    return "you can see this secret message!";
  }),
  getListOrganization: protectedProcedure.query(async ({ ctx }) => {
    const result = await auth.api.listOrganizations({
      headers: ctx.headers,
    })
    return result
  }),
  createOrganization: protectedProcedure.input(
    z.object({
      name: z.string().min(1, "Organization name is required"),
    })
  ).mutation(async ({ ctx, input }) => {
    const result = await auth.api.createOrganization({
      headers: ctx.headers,
      body: {
        name: input.name,
        slug: input.name,
      }
    })
    return result
  }),
  linkAccountWithOrganization: protectedProcedure.input(
    z.object({
      organizationId: z.string(),
      provider: z.enum(['facebook']),
    })
  ).mutation(async ({ ctx, input }) => {
    const {session, db} = ctx;
    const userId = session.user.id;

    const member = await db.query.member.findFirst({
      where: (member, {eq, and}) => and(eq(member.userId, userId), eq(member.organizationId, input.organizationId)),
    });

    if(!member) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: "Can't find organization with given id",
      });
    }

    const pendingOrganizationAccount = await db.query.organizationAccount.findFirst({
      where: (orgAccount, {eq, and}) => and(eq(orgAccount.ownerId, userId), eq(orgAccount.organizationId, input.organizationId), eq(orgAccount.status, OrganizationStatus.PENDING)),
    })

    if(pendingOrganizationAccount){
      await db.update(organizationAccount).set({
        status: OrganizationStatus.CANCELED,
      }).where(eq(organizationAccount.id, pendingOrganizationAccount.id))
    }

    const response = await auth.api.linkSocialAccount({
      headers: ctx.headers,
      body: {
        provider: input.provider,
        callbackURL: '/organization'
      }
    })

    await db.insert(organizationAccount).values({
      organizationId: member.organizationId,
      ownerId: userId,
      status: OrganizationStatus.PENDING,
      createdAt: new Date(),
    })

    return response
  })
} satisfies TRPCRouterRecord;