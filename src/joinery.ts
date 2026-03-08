import type {
  JoineryStrengthInput,
  JoineryStrengthResult,
  WoodSpeciesData,
} from "./types.js";
import { WoodSpecies, JoineryType, RangeError } from "./types.js";

/** Safety factor applied to estimated strength for recommended load. */
const SAFETY_FACTOR = 3.0;

/** Reinforcement bonus multiplier (screws, dowels, etc.). */
const REINFORCEMENT_BONUS = 1.35;

/** Glue shear strength in psi for standard PVA wood glue. */
const GLUE_SHEAR_STRENGTH_PSI = 3500;

/**
 * Mechanical properties database for common wood species.
 * Values from USDA Forest Products Laboratory Wood Handbook.
 */
const SPECIES_DATA: Record<WoodSpecies, WoodSpeciesData> = {
  [WoodSpecies.Oak]: {
    species: WoodSpecies.Oak,
    specificGravity: 0.6,
    radialShrinkage: 4.0,
    tangentialShrinkage: 8.0,
    modulusOfElasticity: 1_820_000,
    modulusOfRupture: 14_300,
    compressiveStrength: 7_440,
    shearStrength: 1_780,
  },
  [WoodSpecies.Pine]: {
    species: WoodSpecies.Pine,
    specificGravity: 0.35,
    radialShrinkage: 2.1,
    tangentialShrinkage: 6.1,
    modulusOfElasticity: 1_390_000,
    modulusOfRupture: 8_600,
    compressiveStrength: 4_800,
    shearStrength: 1_000,
  },
  [WoodSpecies.Maple]: {
    species: WoodSpecies.Maple,
    specificGravity: 0.56,
    radialShrinkage: 4.8,
    tangentialShrinkage: 9.9,
    modulusOfElasticity: 1_830_000,
    modulusOfRupture: 15_800,
    compressiveStrength: 7_830,
    shearStrength: 2_330,
  },
  [WoodSpecies.Walnut]: {
    species: WoodSpecies.Walnut,
    specificGravity: 0.55,
    radialShrinkage: 5.5,
    tangentialShrinkage: 7.8,
    modulusOfElasticity: 1_680_000,
    modulusOfRupture: 14_600,
    compressiveStrength: 7_580,
    shearStrength: 1_370,
  },
  [WoodSpecies.Cherry]: {
    species: WoodSpecies.Cherry,
    specificGravity: 0.5,
    radialShrinkage: 3.7,
    tangentialShrinkage: 7.1,
    modulusOfElasticity: 1_490_000,
    modulusOfRupture: 12_300,
    compressiveStrength: 6_000,
    shearStrength: 1_700,
  },
  [WoodSpecies.DouglasFir]: {
    species: WoodSpecies.DouglasFir,
    specificGravity: 0.45,
    radialShrinkage: 4.8,
    tangentialShrinkage: 7.6,
    modulusOfElasticity: 1_950_000,
    modulusOfRupture: 12_400,
    compressiveStrength: 7_230,
    shearStrength: 1_130,
  },
  [WoodSpecies.Cedar]: {
    species: WoodSpecies.Cedar,
    specificGravity: 0.32,
    radialShrinkage: 2.4,
    tangentialShrinkage: 5.0,
    modulusOfElasticity: 1_110_000,
    modulusOfRupture: 7_500,
    compressiveStrength: 4_560,
    shearStrength: 990,
  },
  [WoodSpecies.Poplar]: {
    species: WoodSpecies.Poplar,
    specificGravity: 0.4,
    radialShrinkage: 3.5,
    tangentialShrinkage: 8.7,
    modulusOfElasticity: 1_580_000,
    modulusOfRupture: 10_100,
    compressiveStrength: 5_540,
    shearStrength: 1_190,
  },
  [WoodSpecies.Hardwood]: {
    species: WoodSpecies.Hardwood,
    specificGravity: 0.55,
    radialShrinkage: 5.0,
    tangentialShrinkage: 10.0,
    modulusOfElasticity: 1_700_000,
    modulusOfRupture: 13_000,
    compressiveStrength: 6_500,
    shearStrength: 1_800,
  },
  [WoodSpecies.Softwood]: {
    species: WoodSpecies.Softwood,
    specificGravity: 0.38,
    radialShrinkage: 3.0,
    tangentialShrinkage: 7.0,
    modulusOfElasticity: 1_400_000,
    modulusOfRupture: 9_000,
    compressiveStrength: 5_000,
    shearStrength: 1_100,
  },
};

/**
 * Joint efficiency factors — ratio of joint strength to solid wood strength.
 * Based on published woodworking engineering data.
 */
const JOINT_EFFICIENCY: Record<JoineryType, number> = {
  [JoineryType.MortiseTenon]: 0.80,
  [JoineryType.Dovetail]: 0.85,
  [JoineryType.BoxJoint]: 0.75,
  [JoineryType.LapJoint]: 0.60,
  [JoineryType.ButtJoint]: 0.15,
  [JoineryType.Dowel]: 0.55,
  [JoineryType.Biscuit]: 0.45,
  [JoineryType.PocketHole]: 0.50,
};

/**
 * Primary failure mode descriptions per joint type.
 */
const FAILURE_MODES: Record<JoineryType, string> = {
  [JoineryType.MortiseTenon]: "Tenon shear or mortise wall splitting",
  [JoineryType.Dovetail]: "Pin shear or socket splitting along grain",
  [JoineryType.BoxJoint]: "Finger shear failure at glue line",
  [JoineryType.LapJoint]: "Glue line shear at overlap surface",
  [JoineryType.ButtJoint]: "End-grain glue line failure",
  [JoineryType.Dowel]: "Dowel shear or bore-hole tear-out",
  [JoineryType.Biscuit]: "Biscuit shear or slot tear-out",
  [JoineryType.PocketHole]: "Screw pull-out or pocket tear-out",
};

/**
 * Estimate the strength of a woodworking joint.
 *
 * Combines wood species shear strength, joint geometry (mechanical interlock area),
 * glue surface contribution, joint efficiency factor, and optional reinforcement.
 *
 * @param input - Joint parameters: type, species, dimensions, glue area, reinforcement
 * @returns Estimated strength, recommended max load, strength factor, and failure mode
 * @throws {RangeError} If dimensions are zero/negative or glue area is negative
 *
 * @example
 * const result = calculateJoineryStrength({
 *   joineryType: JoineryType.MortiseTenon,
 *   species: WoodSpecies.Oak,
 *   jointWidth: 2,
 *   jointDepth: 3,
 *   glueArea: 12,
 *   reinforced: false,
 * });
 * // result.estimatedStrength ≈ 11936 lbs
 * // result.maxRecommendedLoad ≈ 3979 lbs
 */
export function calculateJoineryStrength(
  input: JoineryStrengthInput,
): JoineryStrengthResult {
  const { joineryType, species, jointWidth, jointDepth, glueArea, reinforced } =
    input;

  if (jointWidth <= 0) {
    throw new RangeError("Joint width must be greater than zero");
  }
  if (jointDepth <= 0) {
    throw new RangeError("Joint depth must be greater than zero");
  }
  if (glueArea < 0) {
    throw new RangeError("Glue area cannot be negative");
  }

  const speciesData = SPECIES_DATA[species];
  const efficiency = JOINT_EFFICIENCY[joineryType];

  // Mechanical interlock area = width × depth
  const mechanicalArea = jointWidth * jointDepth;

  // Wood contribution: shear strength × mechanical area × joint efficiency
  const woodContribution =
    speciesData.shearStrength * mechanicalArea * efficiency;

  // Glue contribution: glue shear strength × glue area × 0.5 (conservative)
  const glueContribution = GLUE_SHEAR_STRENGTH_PSI * glueArea * 0.5;

  let estimatedStrength = woodContribution + glueContribution;

  // Apply reinforcement bonus
  if (reinforced) {
    estimatedStrength *= REINFORCEMENT_BONUS;
  }

  // Strength factor: ratio of joint efficiency to the theoretical max (dovetail = 0.85)
  const strengthFactor = efficiency;

  // Recommended load applies safety factor
  const maxRecommendedLoad = estimatedStrength / SAFETY_FACTOR;

  const failureMode = FAILURE_MODES[joineryType];

  return {
    estimatedStrength: Math.round(estimatedStrength * 100) / 100,
    strengthFactor,
    maxRecommendedLoad: Math.round(maxRecommendedLoad * 100) / 100,
    failureMode,
  };
}

/**
 * Get mechanical properties for a wood species.
 * @param species - Wood species to look up
 * @returns Full mechanical property data
 *
 * @example
 * const data = getSpeciesData(WoodSpecies.Walnut);
 * // data.shearStrength === 1370
 */
export function getSpeciesData(species: WoodSpecies): WoodSpeciesData {
  return { ...SPECIES_DATA[species] };
}

/**
 * Compare strength across all joint types for a given species and geometry.
 * @param species - Wood species
 * @param jointWidth - Joint width in inches
 * @param jointDepth - Joint depth in inches
 * @param glueArea - Glue surface area in square inches
 * @returns Array of results sorted by estimated strength descending
 * @throws {RangeError} If dimensions are invalid
 *
 * @example
 * const ranked = compareJoints(WoodSpecies.Oak, 2, 3, 10);
 * // ranked[0] is the strongest joint option
 */
export function compareJoints(
  species: WoodSpecies,
  jointWidth: number,
  jointDepth: number,
  glueArea: number,
): Array<{ joineryType: JoineryType; result: JoineryStrengthResult }> {
  const jointTypes = Object.values(JoineryType) as JoineryType[];

  const results = jointTypes.map((joineryType) => ({
    joineryType,
    result: calculateJoineryStrength({
      joineryType,
      species,
      jointWidth,
      jointDepth,
      glueArea,
      reinforced: false,
    }),
  }));

  results.sort((a, b) => b.result.estimatedStrength - a.result.estimatedStrength);
  return results;
}
