[![CI](https://github.com/AdametherzLab/wood-calc/actions/workflows/ci.yml/badge.svg)](https://github.com/AdametherzLab/wood-calc/actions) [![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

# wood-calc 🌲

A precise, zero-dependency TypeScript calculator for woodworking material planning, moisture science, and joinery strength. Stop guessing and start building with confidence.

## ✨ Features

✅ **Board Feet & Linear Feet** – Calculate lumber volume and length from dimensions, supporting nominal sizes (2×4, etc.) and quantities.

✅ **Sheet Material Planning** – Determine plywood or MDF sheet counts with configurable waste factors.

✅ **Moisture Content & Equilibrium** – Compute MC from weight, predict EMC for your shop environment, and estimate drying times.

✅ **Wood Shrinkage Prediction** – Forecast dimensional changes for 20+ common species when moisture content shifts.

✅ **Joinery Strength Estimates** – Get comparative strength ratings for mortise & tenon, dovetails, box joints, and more.

✅ **Type-Safe & Zero Dependencies** – Built with strict TypeScript, using only Node.js/Bun built-ins. No runtime bloat.

## 📦 Installation

```bash
# Using npm
npm install @adametherzlab/wood-calc

# Using Bun
bun add @adametherzlab/wood-calc
```

## 🚀 Quick Start

```typescript
// REMOVED external import: import { calculateBoardFeet, WoodSpecies, calculateShrinkage } from '@adametherzlab/wood-calc';

// How much lumber for a table top?
const tableTopLumber = calculateBoardFeet({
  thickness: 1.5, // inches (S4S)
  width: 8,
  length: 72,
  quantity: 3
});
console.log(`You need ${tableTopLumber.value.toFixed(1)} board feet.`);

// Will my oak boards shrink when brought indoors?
const shrinkage = calculateShrinkage(WoodSpecies.Oak, 19, 8);
console.log(`Expect ~${shrinkage.tangential.toFixed(1)}% width shrinkage.`);
```

## 📚 API Reference

### Lumber Calculations

#### `calculateBoardFeet(input: BoardFeetInput): CalculationResult<BoardFeet>`
- **`input`**: Object with `thickness`, `width`, `length` (inches), and `quantity`.
- **Returns**: A result object containing the `value` (board feet) and `metadata`.
- **Throws**: `RangeError` if any dimension ≤ 0.
- **Example**: `calculateBoardFeet({ thickness: 1.5, width: 3.5, length: 96, quantity: 4 })` → ~14.0 BF.

#### `calculateLinearFeet(input: LinearFeetInput): CalculationResult<LinearFeet>`
- **`input`**: Object with `length` (inches) and `quantity`.
- **Returns**: Result with linear feet value.
- **Throws**: `RangeError` if length or quantity ≤ 0.
- **Example**: `calculateLinearFeet({ length: 96, quantity: 6 })` → 48 linear feet.

#### `calculateSheetCount(input: SheetCountInput): CalculationResult<number>`
Calculates number of 4'×8' sheets (or custom size) needed, rounded up.
- **`input`**: Object with `area` (sq in), `sheetWidth`, `sheetLength` (inches), and `wasteFactor` (decimal).
- **Returns**: Result with sheet count (integer).
- **Throws**: `RangeError` for invalid inputs.
- **Example**: `calculateSheetCount({ area: 5760, sheetWidth: 48, sheetLength: 96, wasteFactor: 0.1 })` → 2 sheets.

#### `calculateTotalBoardFeet(boards: readonly BoardFeetInput[]): CalculationResult<BoardFeet>`
- **`boards`**: Array of `BoardFeetInput` objects.
- **Returns**: Total board feet.
- **Throws**: `RangeError` if any board is invalid.
- **Example**: Pass an array of board objects to get a project total.

### Moisture & Shrinkage

#### `calculateMoistureContent(input: MoistureContentInput): number`
Calculates moisture content percentage: `((wet - dry) / dry) × 100`.
- **`input`**: Object with `wetWeight` and `dryWeight` (pounds).
- **Returns**: MC percentage (can exceed 100 for green wood).
- **Throws**: `RangeError` if dryWeight ≤ 0 or wetWeight < dryWeight.
- **Example**: `calculateMoistureContent({ wetWeight: 12.5, dryWeight: 10.0 })` → 25.0%.

#### `calculateEquilibriumMC(input: EquilibriumMCInput): number`
Predicts wood's equilibrium moisture content using the Hailwood-Horrobin model.
- **`input`**: Object with `temperature` (°F) and `relativeHumidity` (%).
- **Returns**: Predicted EMC percentage.
- **Throws**: `RangeError` if temperature < -40 or > 200°F, or humidity < 0 or > 100%.
- **Example**: `calculateEquilibriumMC({ temperature: 70, relativeHumidity: 50 })` → ~9.1%.

#### `calculateShrinkage(species: WoodSpecies, initialMC: number, finalMC: number): ShrinkageResult`
- **`species`**: Member of the `WoodSpecies` enum (e.g., `WoodSpecies.Oak`).
- **`initialMC`**, **`finalMC`**: Moisture content percentages.
- **Returns**: Object with `radial`, `tangential`, and `volumetric` shrinkage percentages.
- **Throws**: `RangeError` if MC values are negative.
- **Example**: `calculateShrinkage(WoodSpecies.Oak, 19, 8)` → shrinkage percentages.

#### `getShrinkageCoefficients(species: WoodSpecies): { radial: number; tangential: number }`
- **`species`**: The wood species to query.
- **Returns**: An object with the two coefficients.
- **Example**: `getShrinkageCoefficients(WoodSpecies.Maple)` → `{ radial: 4.8, tangential: 9.9 }`.

#### `getFSPFactor(moistureContent: number): number`
Calculates a linear factor (0–1) representing position relative to the Fiber Saturation Point (~28% MC).
- **`moistureContent`**: Current MC percentage.
- **Returns**: Factor where 0 = oven-dry, 1 = at/beyond FSP.
- **Example**: `getFSPFactor(15)` → `0.536` (15/28).

#### `estimateDryingTime(thickness: number, initialMC: number, targetMC: number, temperature: number, relativeHumidity: number): number`
- **`thickness`**: Board thickness in inches.
- **`initialMC`**, **`targetMC`**: Start and goal MC percentages.
- **`temperature`**, **`relativeHumidity`**: Ambient conditions.
- **Returns**: Estimated time in hours.
- **Throws**: `RangeError` for invalid inputs.
- **Example**: `estimateDryingTime(1.5, 20, 8, 70, 50)` → ~720 hours (30 days).

### Enums & Types

#### `WoodSpecies`
Common species with pre-loaded shrinkage data: `Oak`, `Maple`, `Walnut`, `Cherry`, `Pine`, `Fir`, `Spruce`, `Cedar`, `Poplar`, `Mahogany`, `Ash`, `Beech`, `Birch`, `Hickory`, `Teak`, `Basswood`, `Alder`, `Sycamore`, `Cypress`, `Redwood`.

#### `JoineryType`
## 🛠️ Advanced Usage: Cabinet Project Planner

```typescript
import {
  calculateSheetCount,
  calculateTotalBoardFeet,
  calculateEquilibriumMC,
  WoodSpecies,
  calculateShrinkage,
  JoineryType
} from '@adametherzlab/wood-calc';

// 1. Plywood for carcases
const sheetNeeded = calculateSheetCount({
  area: 40 * 144, // 40 sq ft → sq in
  sheetWidth: 48,
  sheetLength: 96,
  wasteFactor: 0.15 // 15% waste for cuts
});
console.log(`Buy ${sheetNeeded.value} sheets of 3/4" plywood.`);

// 2. Solid wood for face frames and doors
const totalBF = calculateTotalBoardFeet([
  { thickness: 0.75, width: 2.5, length: 96, quantity: 8 }, // Stiles
  { thickness: 0.75, width: 2.5, length: 18, quantity: 12 }, // Rails
  { thickness: 0.75, width: 8, length: 24, quantity: 4 }     // Door panels
]);
console.log(`Need ${totalBF.value.toFixed(1)} BF of maple.`);

// 3. Predict shop EMC
const shopEMC = calculateEquilibriumMC({ temperature: 68, relativeHumidity: 45 });
console.log(`Shop EMC is ${shopEMC.toFixed(1)}%. Mill lumber to this MC for stability.`);

// 4. Plan for seasonal movement
const movement = calculateShrinkage(WoodSpecies.Maple, shopEMC, 6); // If indoor RH drops
console.log(`Door panels may shrink ${movement.tangential.toFixed(2)}% in width.`);
```

## 🔬 Scientific Basis

- **Equilibrium Moisture Content (EMC)**: Uses the Hailwood-Horrobin sorption model, which relates temperature, relative humidity, and wood's hygroscopic properties. The approximation is valid for typical workshop conditions (40–120°F, 20–80% RH).

- **Shrinkage Prediction**: Applies species-specific coefficients (radial `S_r`, tangential `S_t`) from the USDA Forest Products Laboratory *Wood Handbook* (FPL-GTR-282). Shrinkage below the Fiber Saturation Point (~28% MC) is assumed linear: `ΔDimension = Coefficient × (MC_change / 28)`.

- **Drying Time Estimation**: Implements a simplified Fickian diffusion model where drying rate is proportional to thickness squared and the driving force (MC gradient). This provides a first-order approximation for planning.

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, coding standards, and pull request guidelines.

## 📄 License

MIT © [AdametherzLab](https://github.com/AdametherzLab)