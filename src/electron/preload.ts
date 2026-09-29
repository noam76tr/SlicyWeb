/**
 * Wichy
 * Electron Preload Process
 *
 * Based on:
 * - ARCHITECTURE.md
 * - TECH_STACK.md
 * - API_SPEC.md
 */

import {
  contextBridge,
  ipcRenderer,
} from "electron";

contextBridge.exposeInMainWorld(
  "wichy",
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
      return ipcRenderer.invoke(
        channel,
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
