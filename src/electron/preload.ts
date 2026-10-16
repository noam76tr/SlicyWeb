/**
 * SlicyWeb
 * Electron Preload Process
 *
 * Exposes IPC API to renderer process with context isolation.
 *
 * Only the channels of the allow list (src/electron/ipc/IpcChannels.ts)
 * are accepted: invoke() rejects any other channel, send() and on()
 * throw an error. on() returns a function that removes its listener.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - TECH_STACK.md
 * - API_SPEC.md (IPC Layer, Allowed IPC Channels)
 * - DATA_SCHEMA.md (IPC Payload Schema)
 */

import {
  contextBridge,
  ipcRenderer,
  type IpcRendererEvent,
} from "electron";

import {
  isInvokeChannel,
  isReceiveChannel,
  isSendChannel,
} from "./ipc/IpcChannels";

// Generate unique request ID
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function refusedChannel(channel: string): Error {
  return new Error(`IPC channel not allowed: ${channel}`);
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
      if (!isSendChannel(channel)) {
        throw refusedChannel(channel);
      }

      ipcRenderer.send(
        channel,
        data,
      );
    },

    invoke: (
      channel: string,
      data?: unknown,
    ): Promise<unknown> => {
      if (!isInvokeChannel(channel)) {
        return Promise.reject(refusedChannel(channel));
      }

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
    ): (() => void) => {
      if (!isReceiveChannel(channel)) {
        throw refusedChannel(channel);
      }

      // The Electron event is not passed to the renderer
      const listener = (
        _event: IpcRendererEvent,
        data: unknown,
      ): void => {
        callback(data);
      };

      ipcRenderer.on(
        channel,
        listener,
      );

      // Removes this listener only
      return () => {
        ipcRenderer.removeListener(
          channel,
          listener,
        );
      };
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
      on: (channel: string, callback: (data: unknown) => void) => () => void;
    };
  }
}
