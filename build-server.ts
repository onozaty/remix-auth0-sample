import esbuild from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectDir = path.dirname(fileURLToPath(import.meta.url));
console.log("build server.ts");
await esbuild.build({
  entryPoints: [path.join(projectDir, "server.ts")],
  outfile: path.join(projectDir, "build/server/start.js"),
  bundle: true,
  platform: "node",
  external: ["./node_modules/*"],
  target: "es2022",
  format: "esm",
  minify: true,
  sourcemap: true,
});
