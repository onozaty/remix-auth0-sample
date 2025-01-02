import { createCookieSessionStorage } from "@remix-run/node";
import { Authenticator } from "remix-auth";
import { Auth0Profile, Auth0Strategy } from "remix-auth-auth0";

export const AUTH0_RETURN_TO_URL = process.env.AUTH0_RETURN_TO_URL!;
export const AUTH0_CALLBACK_URL = process.env.AUTH0_CALLBACK_URL!;
export const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID!;
export const AUTH0_CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET!;
export const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN!;
export const AUTH0_LOGOUT_URL = process.env.AUTH0_LOGOUT_URL!;
export const SECRETS = process.env.SECRETS!;

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "_remix_session",
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secrets: [SECRETS],
    secure: process.env.NODE_ENV === "production",
  },
});

export const authenticator = new Authenticator<Auth0Profile>(sessionStorage);

const auth0Strategy = new Auth0Strategy(
  {
    callbackURL: AUTH0_CALLBACK_URL,
    clientID: AUTH0_CLIENT_ID,
    clientSecret: AUTH0_CLIENT_SECRET,
    domain: AUTH0_DOMAIN,
  },
  async ({ profile }) => {
    //
    // Use the returned information to process or write to the DB.
    //
    return profile;
  }
);

authenticator.use(auth0Strategy);

export const { getSession, commitSession, destroySession } = sessionStorage;
