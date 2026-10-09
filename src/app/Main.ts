/**
 * SlicyWeb
 * Main Entry Point
 *
 * Responsible for:
 * - Application bootstrap
 * - Startup sequence execution
 * - Error handling
 * - Process management
 *
 * No business logic.
 * No rendering logic.
 * No repository logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - PERFORMANCE_SPEC.md
 */

import { Startup } from "./Startup";

async function main(): Promise<void> {
  try {
    const startup = new Startup();

    await startup.execute();

    console.info("[SlicyWeb] Startup completed.");
  } catch (error) {
    console.error("[SlicyWeb] Startup failed.", error);

    process.exit(1);
  }
}

void main();
