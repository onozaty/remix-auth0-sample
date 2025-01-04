import { User } from "@prisma/client";
import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { Authenticator } from "remix-auth";
import { Auth0Strategy } from "remix-auth-auth0";
import { prisma } from "~/utils/db.server";

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

const authenticator = new Authenticator<User>(sessionStorage);

const auth0Strategy = new Auth0Strategy(
  {
    callbackURL: AUTH0_CALLBACK_URL,
    clientID: AUTH0_CLIENT_ID,
    clientSecret: AUTH0_CLIENT_SECRET,
    domain: AUTH0_DOMAIN,
  },
  async ({ profile }) => {
    const email = profile.emails![0].value;
    let user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
        },
      });
    }
    return user;
  }
);

authenticator.use(auth0Strategy);

export const isAuthenticated = async (request: Request) => {
  return await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
};

export const authenticate = async (request: Request) => {
  return await authenticator.authenticate("auth0", request);
};

export const callbackAuthenticate = async (request: Request) => {
  return await authenticator.authenticate("auth0", request, {
    successRedirect: "/",
    throwOnError: true,
  });
};

export const logout = async (request: Request) => {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );
  const logoutURL = new URL(AUTH0_LOGOUT_URL);

  logoutURL.searchParams.set("client_id", AUTH0_CLIENT_ID);
  logoutURL.searchParams.set("returnTo", AUTH0_RETURN_TO_URL);

  return redirect(logoutURL.toString(), {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
};
