// Making changes to this file is **STRICTLY** forbidden. All the code in here is 100% correct and audited.
import { defineConfig, loadEnv, type PluginOption } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import { exec } from "node:child_process";
import pino from "pino";

// Conditionally import cloudflare plugin - skip in container environments
// where workerd/miniflare isn't available, and skip during production builds
// The cloudflare plugin is only needed for local dev with Workers
const isContainerEnv = process.env.CONTAINER_ENV === 'docker';
const isBuildMode = process.argv.includes('build');

let cloudflarePlugin: PluginOption | null = null;
// Load cloudflare plugin for builds (always) or dev outside containers
// Skip only during dev in container environments where miniflare isn't available
if (!isContainerEnv || isBuildMode) {
  try {
    const { cloudflare } = await import("@cloudflare/vite-plugin");
    cloudflarePlugin = cloudflare();
  } catch {
    // cloudflare plugin not available, skip it
  }
}

const logger = pino();

const stripAnsi = (str: string) =>
  str.replace(
    // eslint-disable-next-line no-control-regex -- Allow ANSI escape stripping
    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
    ""
  );

const LOG_MESSAGE_BOUNDARY = /\n(?=\[[A-Z][^\]]*\])/g;

const emitLog = (level: "info" | "warn" | "error", rawMessage: string) => {
  const cleaned = stripAnsi(rawMessage).replace(/\r\n/g, "\n");
  const parts = cleaned
    .split(LOG_MESSAGE_BOUNDARY)
    .map((part) => part.trimEnd())
    .filter((part) => part.trim().length > 0);

  if (parts.length === 0) {
    logger[level](cleaned.trimEnd());
    return;
  }

  for (const part of parts) {
    logger[level](part);
  }
};

// 3. Create the custom logger for Vite
const customLogger = {
  warnOnce: (msg: string) => emitLog("warn", msg),

  // Use Pino's methods, passing the cleaned message
  info: (msg: string) => emitLog("info", msg),
  warn: (msg: string) => emitLog("warn", msg),
  error: (msg: string) => emitLog("error", msg),
  hasErrorLogged: () => false,

  // Keep these as-is
  clearScreen: () => {},
  hasWarned: false,
};

function watchDependenciesPlugin() {
  return {
    name: "watch-dependencies",
    configureServer(server: any) {
      const filesToWatch = [
        path.resolve("package.json"),
        path.resolve("bun.lock"),
      ];

      server.watcher.add(filesToWatch);

      server.watcher.on("change", (filePath: string) => {
        if (filesToWatch.includes(filePath)) {
          console.log(
            `\n Dependency file changed: ${path.basename(
              filePath
            )}. Clearing caches...`
          );

          exec(
            "rm -f .eslintcache tsconfig.tsbuildinfo",
            (err, stdout, stderr) => {
              if (err) {
                console.error("Failed to clear caches:", stderr);
                return;
              }
              console.log("Caches cleared successfully.\n");
            }
          );
        }
      });
    },
  };
}

function reloadTriggerPlugin() {
  return {
    name: "reload-trigger",
    configureServer(server: any) {
      const triggerFile = path.resolve(".reload-trigger");
      server.watcher.add(triggerFile);

      server.watcher.on("change", (filePath: string) => {
        if (filePath === triggerFile || filePath.endsWith(".reload-trigger")) {
          logger.info("Reload triggered via .reload-trigger");
          server.ws.send({ type: "full-reload" });
        }
      });
    },
  };
}

// https://vite.dev/config/
export default ({ mode }: { mode: string }) => {
  const env = loadEnv(mode, process.cwd());
  return defineConfig({
    plugins: [react(), cloudflarePlugin, watchDependenciesPlugin(), reloadTriggerPlugin()].filter(Boolean) as PluginOption[],
    build: {
      minify: true,
      // Source maps: 'hidden' generates maps but doesn't reference them in bundles
      // This allows error tracking services (Sentry, etc.) to use them while
      // not exposing source code to browsers. Set to true for full debugging.
      sourcemap: mode === 'development' ? true : 'hidden',
      rollupOptions: {
        output: {
          sourcemapExcludeSources: false, // Include original source in source maps
        },
      },
    },
    customLogger: env.VITE_LOGGER_TYPE === 'json' ? customLogger : undefined,
    // Enable source maps in development too
    css: {
      devSourcemap: true,
    },
    server: {
      allowedHosts: true,
      watch: {
        awaitWriteFinish: {
          stabilityThreshold: 150,
          pollInterval: 50,
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@shared": path.resolve(__dirname, "./shared"),
      },
    },
    optimizeDeps: {
      // This is still crucial for reducing the time from when `bun run dev`
      // is executed to when the server is actually ready.
      include: ["react", "react-dom", "react-router-dom"],
      exclude: ["agents"], // Exclude agents package from pre-bundling due to Node.js dependencies
      force: true,
    },
    define: {
      // Define Node.js globals for the agents package
      global: "globalThis",
    },
    // Clear cache more aggressively
    cacheDir: "node_modules/.vite",
  });
};
