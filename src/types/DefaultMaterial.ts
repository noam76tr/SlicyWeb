// src/types/DefaultMaterial.ts

import { Material } from "./Material";

export const DEFAULT_MATERIAL: Material = {
  id: "pla_default",

  name: "PLA",

  category: "PLA",

  description: "Standard PLA profile",

  temperature: {
    minNozzle: 190,
    maxNozzle: 220,
    minBed: 50,
    maxBed: 60,
  },

  cooling: {
    fanMin: 80,
    fanMax: 100,
  },

  physical: {
    density: 1.24,
    shrinkage: 0.2,
    warpingRisk: "low",
  },

  recommended: {
    printSpeed: 80,
    travelSpeed: 200,
    retractionDistance: 0.8,
    retractionSpeed: 35,
  },
};
