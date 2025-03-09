import { env } from "~/env";

const apiVersion = "v20.0";
const baseUrl = `https://graph.facebook.com/${apiVersion}`;

export const getFacebookLongTermAccessToken = async (token: string) => {
  const params = {
    grant_type: "fb_exchange_token",
    client_id: env.FACEBOOK_CLIENT_ID,
    client_secret: env.FACEBOOK_CLIENT_SECRET,
    fb_exchange_token: token,
  };

  try {
    const response = await fetch(
      `${baseUrl}/oauth/access_token?${new URLSearchParams(params).toString()}`,
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch ${baseUrl}`);
    }

    return await response.json() as {
      access_token: string;
      token_type: string; // bearer
      expires_in: number; //The number of seconds until the token expires
    };
  } catch (err) {
    throw err
  }
};
