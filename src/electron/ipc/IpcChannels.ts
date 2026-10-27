/**
 * SlicyWeb
 * IPC Channels
 *
 * Allow list of the IPC channels the renderer may use through the
 * preload bridge (src/electron/preload.ts). Any other channel is
 * refused by the bridge.
 *
 * INVOKE_CHANNELS: request/response channels registered with
 * ipcMain.handle in src/electron/ipc/. A new handler must be added
 * here; npm run check:ipc compares this list with the handlers.
 *
 * SEND_CHANNELS and RECEIVE_CHANNELS: one-way messages from and to
 * the renderer. None is used yet.
 *
 * Based on:
 * - API_SPEC.md (IPC API, Allowed IPC Channels)
 * - ARCHITECTURE.md
 * - CHANGELOG.md (KI-016)
 */

export const INVOKE_CHANNELS = [
  "import:3mf",
  "import:stl",
  "import:validate",
  "printer:add",
  "printer:count",
  "printer:get",
  "printer:getAll",
  "printer:refresh",
  "printer:remove",
  "printer:update",
  "project:create",
  "project:delete",
  "project:load",
  "project:save",
  "settings:get",
  "settings:language",
  "settings:reset",
  "settings:theme",
  "settings:update",
  "storage:clear",
  "storage:delete",
  "storage:load",
  "storage:save",
] as const;

export const SEND_CHANNELS = [] as const;

export const RECEIVE_CHANNELS = [] as const;

export type InvokeChannel = (typeof INVOKE_CHANNELS)[number];

export function isInvokeChannel(channel: string): channel is InvokeChannel {
  return (INVOKE_CHANNELS as readonly string[]).includes(channel);
}

export function isSendChannel(channel: string): boolean {
  return (SEND_CHANNELS as readonly string[]).includes(channel);
}

export function isReceiveChannel(channel: string): boolean {
  return (RECEIVE_CHANNELS as readonly string[]).includes(channel);
}
