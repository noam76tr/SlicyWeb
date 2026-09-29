/**
 * SlicyWeb
 * Electron Preload Process
 *
 * Exposes IPC API to renderer process with context isolation.
 * 
 * Based on:
 * - ARCHITECTURE.md
 * - TECH_STACK.md
 * - API_SPEC.md (IPC Layer)
 * - DATA_SCHEMA.md (IPC Payload Schema)
 */

import {
  contextBridge,
  ipcRenderer,
} from "electron";

// Generate unique request ID
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

contextBridge.exposeInMainWorld(
  "slicyWeb",
  {
    version: "1.0.0",

    platform: process.platform,

    isElectron: true,

    send: (
      channel: string,
      data?: unknown,
    ): void => {
      ipcRenderer.send(
        channel,
        data,
      );
    },

    invoke: (
      channel: string,
      data?: unknown,
    ): Promise<unknown> => {
      // Generate unique request ID for this invocation
      const requestId = generateRequestId();

      // Call IPC handler with channel, requestId, and payload
      return ipcRenderer.invoke(
        channel,
        requestId,
        data,
      );
    },

    on: (
      channel: string,
      callback: (
        data: unknown,
      ) => void,
    ): void => {
      ipcRenderer.on(
        channel,
        (
          _event,
          data,
        ) => {
          callback(data);
        },
      );
    },
  },
);

// TypeScript type definitions for window.slicyWeb
declare global {
  interface Window {
    slicyWeb: {
      version: string;
      platform: string;
      isElectron: boolean;
      send: (channel: string, data?: unknown) => void;
      invoke: (channel: string, data?: unknown) => Promise<unknown>;
      on: (channel: string, callback: (data: unknown) => void) => void;
    };
  }
}
