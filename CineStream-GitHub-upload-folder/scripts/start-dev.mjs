import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const dist = join(root, "dist");
const args = process.argv.slice(2);
const portArgIndex = args.findIndex((arg) => arg === "--port");
const port = Number(portArgIndex >= 0 ? args[portArgIndex + 1] : process.env.PORT ?? 5173);

const npmCommand = process.platform === "win32" ? "npm.cmd run build" : "npm run build";
const build = spawnSync(npmCommand, {
  cwd: root,
  stdio: "inherit",
  shell: true
});

if (build.status !== 0) {
  if (build.error) {
    process.stderr.write(`${build.error.message}\n`);
  }
  process.exit(build.status ?? 1);
}

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".svg", "image/svg+xml"],
  [".webp", "image/webp"],
  [".ico", "image/x-icon"]
]);

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", `http://${request.headers.host}`);
    const requestedPath = decodeURIComponent(url.pathname);
    const candidate = normalize(join(dist, requestedPath));
    const safePath = candidate.startsWith(dist) && existsSync(candidate) && !candidate.endsWith("\\")
      ? candidate
      : join(dist, "index.html");
    const body = await readFile(safePath);
    response.writeHead(200, {
      "Content-Type": mimeTypes.get(extname(safePath)) ?? "application/octet-stream",
      "Cache-Control": "no-store"
    });
    response.end(body);
  } catch {
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("CineStream dev server could not serve this file.");
  }
});

server.listen(port, "127.0.0.1", () => {
  process.stdout.write(`CineStream dev server running at http://127.0.0.1:${port}/\n`);
});
