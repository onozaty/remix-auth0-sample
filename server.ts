import { createRequestHandler } from "@remix-run/express";
import compression from "compression";
import express, { Request } from "express";
import { EnvHttpProxyAgent, setGlobalDispatcher } from "undici";
import { isAuthenticated, sessionStorage } from "~/utils/auth.server";

if (process.env.HTTPS_PROXY || process.env.HTTP_PROXY) {
  setGlobalDispatcher(new EnvHttpProxyAgent());
}

export interface CustomRequest extends Request {
  user?: {
    userId: number;
    email: string;
  };
}

const viteDevServer =
  process.env.NODE_ENV === "production"
    ? undefined
    : await import("vite").then((vite) =>
        vite.createServer({
          server: { middlewareMode: true },
        })
      );

const BUILD_INDEX_PATH = "./index.js";
const remixHandler = createRequestHandler({
  build: viteDevServer
    ? () => viteDevServer.ssrLoadModule("virtual:remix/server-build")
    : await import(BUILD_INDEX_PATH),
  getLoadContext(req: CustomRequest) {
    return {
      user: req.user,
    };
  },
});

const app = express();

app.use(compression());

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by");

// handle asset requests
if (viteDevServer) {
  app.use(viteDevServer.middlewares);
} else {
  // Vite fingerprints its assets so we can cache forever.
  app.use(
    "/assets",
    express.static("build/client/assets", { immutable: true, maxAge: "1y" })
  );
}

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static("build/client", { maxAge: "1h" }));

app.use(async (req: CustomRequest, res, next) => {
  try {
    if (
      req.path !== "/login" &&
      req.path !== "/__manifest" &&
      !req.path.startsWith("/auth")
    ) {
      const session = await sessionStorage.getSession(req.headers.cookie);
      const user = await isAuthenticated(session);
      if (user === null) {
        const { method, url } = req;
        console.log(`Request unauthorized: ${method} ${url}`);
        // ログインへリダイレクト
        if (req.header("Accept")?.includes("text/html")) {
          return res.redirect("/login");
        } else {
          // APIリクエストの場合は `X-Remix-Redirect` ヘッダーを返す
          return res
            .status(204)
            .set({
              "X-Remix-Redirect": "/login",
              "X-Remix-Status": "302",
            })
            .end();
        }
      }

      req.user = user;
    }
    next();
  } catch (error) {
    next(error);
  }
});

app.use((req: CustomRequest, res, next) => {
  const { method, url, user } = req;
  console.log(`Request started: ${method} ${url} userId:${user?.userId}`);

  const start = performance.now();

  // レスポンス終了時のイベントでログを出力
  res.on("finish", () => {
    const duration = performance.now() - start;
    const statusCode = res.statusCode;
    console.log(
      `Request completed: ${method} ${url} ${statusCode} - ${duration.toFixed(
        3
      )} ms`
    );
  });

  next();
});

// handle SSR requests
app.all("*", remixHandler);

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`Express server listening at http://localhost:${port}`)
);
