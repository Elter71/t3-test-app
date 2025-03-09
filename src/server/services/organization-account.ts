import {db} from "~/server/db";
import {OrganizationStatus} from "~/server/db/organization-account-status";
import {organizationAccount} from "~/server/db/schema";
import {eq} from "drizzle-orm";
import {type Account} from "better-auth";

export const connectOrganizationAccountWithNewAccount = async (account: Account): Promise<void> => {

  const orgAccount = await db.query.organizationAccount.findFirst(
    {
      where:(organizationAccount, {eq, and}) => and(eq(organizationAccount.ownerId, account.userId), eq(organizationAccount.status, OrganizationStatus.PENDING)),
    }
  )

  if(!orgAccount){
    return;
  }

  await db.update(organizationAccount).set({
    accountId: account.id,
    status: OrganizationStatus.COMPLETED,
  }).where(eq(organizationAccount.id, orgAccount.id));
}

