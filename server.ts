import { createRequestHandler } from "@remix-run/express";
import compression from "compression";
import express from "express";
import { EnvHttpProxyAgent, setGlobalDispatcher } from "undici";

if (process.env.HTTPS_PROXY || process.env.HTTP_PROXY) {
  setGlobalDispatcher(new EnvHttpProxyAgent());
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

app.use((req, res, next) => {
  const { method, url } = req;
  console.log(`Request started: ${method} ${url}`);

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
