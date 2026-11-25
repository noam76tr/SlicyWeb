/**
 * SlicyWeb
 * Recovery Validator
 *
 * Validates the description of the copy written by the automatic save
 * (lot 111, decision 119 of Noam, Q18 and Q19 A; SECURITY_SPEC.md, Auto
 * Save Security: versioned, verified):
 *
 *   { "format": "SlicyWeb Recovery", "version": 1,
 *     "projectName": "cube", "projectPath": "C:\\…\\cube.wyproj" | null,
 *     "savedAt": "2026-11-25T12:32:00.000Z" }
 *
 * projectName is "" for a project never saved; projectPath is the file of
 * the project, or null. The copy itself is validated as any project file
 * (WYPROJImporter).
 *
 * No business logic.
 *
 * Based on:
 * - SECURITY_SPEC.md (Auto Save Security, Recovery Security)
 * - USER_SETTINGS_SPEC.md 2.4.0 (Project Settings)
 */

import { z } from "zod";

import {
  RECOVERY_INFO_FORMAT,
  RECOVERY_INFO_VERSION,
} from "../constants/ProjectConstants";

export const RecoveryInfoSchema = z
  .object({
    format: z.literal(RECOVERY_INFO_FORMAT),
    version: z.literal(RECOVERY_INFO_VERSION),
    projectName: z.string().max(1000),
    projectPath: z.string().min(1).max(4096).nullable(),
    savedAt: z
      .string()
      .min(1)
      .refine((value) => !Number.isNaN(Date.parse(value)), "Invalid date"),
  })
  .strict();

export type RecoveryInfo = z.infer<typeof RecoveryInfoSchema>;

export class RecoveryValidator {
  /** The description, or null when it is not valid */
  public validate(value: unknown): RecoveryInfo | null {
    const result = RecoveryInfoSchema.safeParse(value);

    return result.success ? result.data : null;
  }
}

export default RecoveryValidator;
