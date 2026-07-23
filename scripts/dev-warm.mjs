import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";

const forwardedArgs = process.argv.slice(2);
const portFlagIndex = forwardedArgs.findIndex(
  (argument) => argument === "-p" || argument === "--port",
);
const port =
  portFlagIndex >= 0 && forwardedArgs[portFlagIndex + 1]
    ? forwardedArgs[portFlagIndex + 1]
    : "3000";
const baseUrl = `http://127.0.0.1:${port}`;
const portArgs = portFlagIndex >= 0 ? [] : ["--port", port];
const nextCli = path.join(
  process.cwd(),
  "node_modules",
  "next",
  "dist",
  "bin",
  "next",
);

const child = spawn(
  process.execPath,
  [nextCli, "dev", ...portArgs, ...forwardedArgs],
  {
    cwd: process.cwd(),
    env: process.env,
    stdio: ["inherit", "pipe", "pipe"],
  },
);

let readinessBuffer = "";
let serverReady = false;
let resolveServerReady;
let rejectServerReady;

const serverReadyPromise = new Promise((resolve, reject) => {
  resolveServerReady = resolve;
  rejectServerReady = reject;
});

const readyTimeout = setTimeout(() => {
  rejectServerReady(
    new Error(`Server non disponibile su ${baseUrl} dopo 90 secondi`),
  );
}, 90_000);

const forwardOutput = (source, destination) => {
  source.on("data", (chunk) => {
    destination.write(chunk);
    readinessBuffer = `${readinessBuffer}${chunk.toString()}`.slice(-2_048);

    if (!serverReady && readinessBuffer.includes("Ready in")) {
      serverReady = true;
      clearTimeout(readyTimeout);
      resolveServerReady();
    }
  });
};

forwardOutput(child.stdout, process.stdout);
forwardOutput(child.stderr, process.stderr);

const routes = [
  "/",
  "/about",
  "/gameMode",
  "/chooseTime?mode=ai",
  "/challenge",
  "/online",
  "/login",
  "/register",
  "/forgot-password",
  "/statistics",
];

const warmRoutes = async () => {
  await serverReadyPromise;
  process.stdout.write("\n[BoardVerse] Precompilazione route principali…\n");

  for (let index = 0; index < routes.length; index += 3) {
    const batch = routes.slice(index, index + 3);
    await Promise.all(
      batch.map(async (route) => {
        const response = await fetch(`${baseUrl}${route}`, {
          signal: AbortSignal.timeout(60_000),
        });
        if (response.status >= 500) {
          throw new Error(`${route}: HTTP ${response.status}`);
        }
      }),
    );
  }

  process.stdout.write(
    `[BoardVerse] Route precompilate. Apri ${baseUrl}\n\n`,
  );
};

void warmRoutes().catch((error) => {
  process.stderr.write(
    `[BoardVerse] Warm-up incompleto: ${error.message}\n`,
  );
});

const stopChild = () => {
  if (child.exitCode === null) child.kill("SIGTERM");
};

process.on("SIGINT", stopChild);
process.on("SIGTERM", stopChild);
child.on("exit", (code) => {
  if (!serverReady) {
    clearTimeout(readyTimeout);
    rejectServerReady(
      new Error(`Next si è chiuso prima di avviare ${baseUrl}`),
    );
  }
  process.exitCode = code ?? 0;
});
