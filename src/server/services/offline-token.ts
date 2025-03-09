import {type Account} from "better-auth";
import {getFacebookLongTermAccessToken} from "~/server/services/facebook";
import {db} from "~/server/db";
import {accountOfflineToken} from "~/server/db/schema";

export const getAndSaveOfflineToken = async (account: Account) => {

  if(!account.accessToken){
    throw new Error("Missing access token");
  }

  if(account.providerId == 'facebook' ){
    const data = await getFacebookLongTermAccessToken(account.accessToken);
    const expiresInInMilSec = data.expires_in * 1000;
    await db.insert(accountOfflineToken).values({
      accountId: account.id,
      token: data.access_token,
      expiresAt: new Date(Date.now() + expiresInInMilSec),
    })
  }

}