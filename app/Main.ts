/**
 * Wichy
 * Main Entry Point
 *
 * Application bootstrap.
 */

import { Startup } from "./Startup";

async function main(): Promise<void> {
  try {
    const startup = new Startup();

    await startup.execute();

    console.info("[Wichy] Startup completed.");
  } catch (error) {
    console.error("[Wichy] Startup failed.", error);

    process.exit(1);
  }
}

void main();
