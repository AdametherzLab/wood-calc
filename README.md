[![CI](https://github.com/AdametherzLab/wood-calc/actions/workflows/ci.yml/badge.svg)](https://github.com/AdametherzLab/wood-calc/actions) [![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

# wood-calc 🌲

A precise, zero-dependency TypeScript calculator for woodworking material planning, moisture science, and joinery strength. Stop guessing and start building with confidence.

## ✨ Features

✅ **Board Feet & Linear Feet** – Calculate lumber volume and length from dimensions, supporting nominal sizes (2×4, etc.) and quantities.

✅ **Sheet Material Planning** – Determine plywood or MDF sheet counts with configurable waste factors.

✅ **Moisture Content & Equilibrium** – Compute MC from weight, predict EMC for your shop environment, and estimate drying times.

✅ **Wood Shrinkage Prediction** – Forecast dimensional changes for 10 common species when moisture content changes.

✅ **Joinery Strength Calculator** – Estimate the strength of 8 joint types (mortise-tenon, dovetail, box joint, lap, butt, dowel, biscuit, pocket hole) based on wood species, dimensions, and glue area.

## 📦 Installation

bash
bun add wood-calc
# or
npm install wood-calc


## 🚀 Usage

### Board Feet


import { calculateBoardFeet } from "wood-calc";

const result = calculateBoardFeet({
  thickness: 1.5,
  width: 3.5,
  length: 96,
  quantity: 4,
});
console.log(result.value); // ≈ 14.0 board feet


### Sheet Count


import { calculateSheetCount } from "wood-calc";

const sheets = calculateSheetCount({
  area: 5760,
  sheetWidth: 48,
  sheetLength: 96,
  wasteFactor: 0.1,
});
console.log(sheets.value); // 2 sheets


### Moisture Content


import { calculateMoistureContent, calculateEquilibriumMC } from "wood-calc";

const mc = calculateMoistureContent({ wetWeight: 12.5, dryWeight: 10.0 });
console.log(mc); // 25.0%

const emc = calculateEquilibriumMC({ temperature: 70, relativeHumidity: 50 });
console.log(emc); // ≈ 9.1%


### Wood Shrinkage


import { calculateShrinkage, WoodSpecies } from "wood-calc";

const shrinkage = calculateShrinkage(WoodSpecies.Oak, 15, 8);
console.log(shrinkage.radial);      // radial shrinkage %
console.log(shrinkage.tangential);   // tangential shrinkage %
console.log(shrinkage.volumetric);   // volumetric shrinkage %


### Joinery Strength


import { calculateJoineryStrength, JoineryType, WoodSpecies } from "wood-calc";

const result = calculateJoineryStrength({
  joineryType: JoineryType.MortiseTenon,
  species: WoodSpecies.Oak,
  jointWidth: 2,
  jointDepth: 3,
  glueArea: 12,
  reinforced: false,
});
console.log(result.estimatedStrength);   // ≈ 29544 lbs
console.log(result.maxRecommendedLoad);  // ≈ 9848 lbs (with 3× safety factor)
console.log(result.failureMode);         // "Tenon shear or mortise wall splitting"


### Compare Joint Types


import { compareJoints, WoodSpecies } from "wood-calc";

const ranked = compareJoints(WoodSpecies.Oak, 2, 3, 10);
ranked.forEach(({ joineryType, result }) => {
  console.log(`${joineryType}: ${result.estimatedStrength} lbs`);
});
// Sorted strongest to weakest


### Get Species Data


import { getSpeciesData, WoodSpecies } from "wood-calc";

const oak = getSpeciesData(WoodSpecies.Oak);
console.log(oak.shearStrength);       // 1780 psi
console.log(oak.specificGravity);      // 0.6
console.log(oak.modulusOfRupture);    // 14300 psi


## 📐 API Reference

### Lumber
- `calculateBoardFeet(input)` — Board feet from dimensions
- `calculateLinearFeet(input)` — Linear feet from length × quantity
- `calculateSheetCount(input)` — Sheet count with waste factor
- `calculateTotalBoardFeet(boards)` — Sum board feet across multiple boards
- `calculateBoardFeetNominal(t, w, l, qty)` — Board feet using nominal sizes (2×4, etc.)

### Moisture
- `calculateMoistureContent(input)` — MC% from wet/dry weights
- `calculateEquilibriumMC(input)` — EMC from temperature & humidity
- `calculateShrinkage(species, initialMC, finalMC)` — Dimensional shrinkage
- `getShrinkageCoefficients(species)` — Species shrinkage data
- `getFSPFactor(mc)` — Fiber saturation point factor
- `estimateDryingTime(thickness, initialMC, targetMC, temp, rh)` — Drying time estimate

### Joinery
- `calculateJoineryStrength(input)` — Estimate joint strength in lbs-force
- `getSpeciesData(species)` — Full mechanical properties for a species
- `compareJoints(species, width, depth, glueArea)` — Rank all 8 joint types by strength

### Enums
- `WoodSpecies` — Oak, Pine, Maple, Walnut, Cherry, DouglasFir, Cedar, Poplar, Hardwood, Softwood
- `JoineryType` — MortiseTenon, Dovetail, BoxJoint, LapJoint, ButtJoint, Dowel, Biscuit, PocketHole

## 🧪 Testing

bash
bun test


## 📄 License

MIT
