/**
 * SlicyWeb
 * IPC Channel Check
 *
 * Checks that the allow list of invoke channels
 * (src/electron/ipc/IpcChannels.ts, INVOKE_CHANNELS) contains exactly
 * the channels registered with ipcMain.handle in src/electron/ipc/.
 *
 * Usage (any platform, including Windows PowerShell):
 *   npm run check:ipc
 *
 * Exit code 0 when both lists match, 1 otherwise.
 *
 * Based on:
 * - API_SPEC.md (Allowed IPC Channels)
 * - CHANGELOG.md (KI-016)
 */

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ipcDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "src",
  "electron",
  "ipc",
);

const channelsFile = "IpcChannels.ts";

// Channels registered with ipcMain.handle("channel", ...)
const registered = new Set();

for (const file of readdirSync(ipcDir)) {
  if (!file.endsWith(".ts") || file === channelsFile) {
    continue;
  }

  const source = readFileSync(join(ipcDir, file), "utf8");

  for (const match of source.matchAll(/ipcMain\.handle\(\s*["']([^"']+)["']/g)) {
    registered.add(match[1]);
  }
}

// Channels of the allow list (INVOKE_CHANNELS = [ ... ])
const listSource = readFileSync(join(ipcDir, channelsFile), "utf8");
const listMatch = listSource.match(/INVOKE_CHANNELS\s*=\s*\[([\s\S]*?)\]/);

if (!listMatch) {
  console.error(`${channelsFile}: INVOKE_CHANNELS not found.`);
  process.exit(1);
}

const allowed = new Set(
  [...listMatch[1].matchAll(/["']([^"']+)["']/g)].map((match) => match[1]),
);

let errors = 0;

for (const channel of registered) {
  if (!allowed.has(channel)) {
    console.error(`Handler without allow list entry: "${channel}"`);
    errors += 1;
  }
}

for (const channel of allowed) {
  if (!registered.has(channel)) {
    console.error(`Allow list entry without handler: "${channel}"`);
    errors += 1;
  }
}

if (errors > 0) {
  console.error(`IPC channel check failed: ${errors} error(s).`);
  process.exit(1);
}

console.log(
  `IPC channel check passed: ${allowed.size} invoke channels, all registered.`,
);
