/**
 * Core type definitions for wood-calc.
 * @module types
 */

/**
 * Common wood species with typical shrinkage characteristics.
 */
export enum WoodSpecies {
  /** Quercus spp. - High strength, moderate shrinkage */
  Oak = "oak",
  /** Pinus spp. - Softwood, low to moderate shrinkage */
  Pine = "pine",
  /** Acer spp. - Hardwood, moderate shrinkage */
  Maple = "maple",
  /** Juglans spp. - Premium hardwood, moderate shrinkage */
  Walnut = "walnut",
  /** Prunus serotina - Hardwood, moderate shrinkage */
  Cherry = "cherry",
  /** Pseudotsuga menziesii - Softwood, low shrinkage */
  DouglasFir = "douglas-fir",
  /** Cedrus spp. - Softwood, low shrinkage, aromatic */
  Cedar = "cedar",
  /** Liriodendron tulipifera - Hardwood, low shrinkage */
  Poplar = "poplar",
  /** Generic hardwood for calculations */
  Hardwood = "hardwood",
  /** Generic softwood for calculations */
  Softwood = "softwood",
}

/**
 * Input parameters for board feet calculation.
 * All dimensions in inches.
 */
export interface BoardFeetInput {
  /** Thickness in inches (nominal or actual) */
  readonly thickness: number;
  /** Width in inches (nominal or actual) */
  readonly width: number;
  /** Length in inches */
  readonly length: number;
  /** Number of identical boards */
  readonly quantity: number;
}

/**
 * Input parameters for sheet material calculation.
 * All dimensions in inches.
 */
export interface SheetCountInput {
  /** Total area to cover in square inches */
  readonly area: number;
  /** Width of each sheet in inches */
  readonly sheetWidth: number;
  /** Length of each sheet in inches */
  readonly sheetLength: number;
  /** Waste factor as decimal (e.g., 0.1 for 10% waste) */
  readonly wasteFactor: number;
}

/**
 * Input parameters for linear feet calculation.
 */
export interface LinearFeetInput {
  /** Length in inches */
  readonly length: number;
  /** Number of identical pieces */
  readonly quantity: number;
}

/**
 * Input parameters for moisture content calculation.
 */
export interface MoistureContentInput {
  /** Wet weight in pounds or consistent unit */
  readonly wetWeight: number;
  /** Dry weight in same unit as wetWeight */
  readonly dryWeight: number;
}

/**
 * Input parameters for equilibrium moisture content calculation.
 */
export interface EquilibriumMCInput {
  /** Temperature in degrees Fahrenheit */
  readonly temperature: number;
  /** Relative humidity as percentage (0-100) */
  readonly relativeHumidity: number;
}

/**
 * Result of shrinkage calculation.
 * All values are percentages (0-100).
 */
export interface ShrinkageResult {
  /** Radial shrinkage percentage */
  readonly radial: number;
  /** Tangential shrinkage percentage */
  readonly tangential: number;
  /** Volumetric shrinkage percentage */
  readonly volumetric: number;
}

/**
 * Common woodworking joinery types.
 */
export enum JoineryType {
  /** Mortise and tenon joint */
  MortiseTenon = "mortise-tenon",
  /** Dovetail joint */
  Dovetail = "dovetail",
  /** Box joint (finger joint) */
  BoxJoint = "box-joint",
  /** Lap joint */
  LapJoint = "lap-joint",
  /** Butt joint with reinforcement */
  ButtJoint = "butt-joint",
  /** Dowel joint */
  Dowel = "dowel",
  /** Biscuit joint */
  Biscuit = "biscuit",
  /** Pocket hole joint */
  PocketHole = "pocket-hole",
}

/**
 * Input parameters for joinery strength estimation.
 */
export interface JoineryStrengthInput {
  /** Type of joinery */
  readonly joineryType: JoineryType;
  /** Wood species */
  readonly species: WoodSpecies;
  /** Joint width in inches */
  readonly jointWidth: number;
  /** Joint depth in inches */
  readonly jointDepth: number;
  /** Glue surface area in square inches */
  readonly glueArea: number;
  /** Whether joint is reinforced (dowels, screws, etc.) */
  readonly reinforced: boolean;
}

/**
 * Result of joinery strength calculation.
 */
export interface JoineryStrengthResult {
  /** Estimated strength in pounds-force */
  readonly estimatedStrength: number;
  /** Strength factor relative to wood species (0-1) */
  readonly strengthFactor: number;
  /** Recommended maximum load in pounds-force */
  readonly maxRecommendedLoad: number;
  /** Failure mode description */
  readonly failureMode: string;
}

/**
 * Wood species characteristics for calculations.
 */
export interface WoodSpeciesData {
  /** Wood species */
  readonly species: WoodSpecies;
  /** Average specific gravity (oven-dry weight/green volume) */
  readonly specificGravity: number;
  /** Radial shrinkage percentage from green to oven-dry */
  readonly radialShrinkage: number;
  /** Tangential shrinkage percentage from green to oven-dry */
  readonly tangentialShrinkage: number;
  /** Modulus of elasticity in psi */
  readonly modulusOfElasticity: number;
  /** Modulus of rupture in psi */
  readonly modulusOfRupture: number;
  /** Compressive strength parallel to grain in psi */
  readonly compressiveStrength: number;
  /** Shear strength parallel to grain in psi */
  readonly shearStrength: number;
}

/**
 * Unit conversion factors.
 */
export interface UnitConversion {
  /** Inches to feet conversion factor */
  readonly inchesToFeet: number;
  /** Feet to inches conversion factor */
  readonly feetToInches: number;
  /** Square inches to square feet conversion factor */
  readonly sqInchesToSqFeet: number;
  /** Square feet to square inches conversion factor */
  readonly sqFeetToSqInches: number;
  /** Board feet to cubic inches conversion factor */
  readonly boardFeetToCubicInches: number;
  /** Cubic inches to board feet conversion factor */
  readonly cubicInchesToBoardFeet: number;
}

/**
 * Calculation result with metadata.
 */
export interface CalculationResult<T> {
  /** The calculated value */
  readonly value: T;
  /** Units of the calculated value */
  readonly units: string;
  /** Input parameters used for calculation */
  readonly input: unknown;
  /** Timestamp of calculation */
  readonly timestamp: Date;
  /** Any warnings generated during calculation */
  readonly warnings: readonly string[];
}

/**
 * Validation error for input parameters.
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Range error for out-of-bounds values.
 */
export class RangeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RangeError";
  }
}

/**
 * Branded type for positive numbers.
 */
export type PositiveNumber = number & { readonly __brand: "PositiveNumber" };

/**
 * Branded type for percentages (0-100).
 */
export type Percentage = number & { readonly __brand: "Percentage" };

/**
 * Branded type for length in inches.
 */
export type Inches = number & { readonly __brand: "Inches" };

/**
 * Branded type for area in square inches.
 */
export type SquareInches = number & { readonly __brand: "SquareInches" };

/**
 * Branded type for volume in cubic inches.
 */
export type CubicInches = number & { readonly __brand: "CubicInches" };

/**
 * Branded type for board feet.
 */
export type BoardFeet = number & { readonly __brand: "BoardFeet" };

/**
 * Branded type for linear feet.
 */
export type LinearFeet = number & { readonly __brand: "LinearFeet" };

/**
 * Branded type for weight in pounds.
 */
export type Pounds = number & { readonly __brand: "Pounds" };

/**
 * Branded type for temperature in Fahrenheit.
 */
export type Fahrenheit = number & { readonly __brand: "Fahrenheit" };

/**
 * Branded type for pressure in psi.
 */
export type Psi = number & { readonly __brand: "Psi" };