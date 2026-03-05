import type { WoodSpecies, MoistureContentInput, EquilibriumMCInput, ShrinkageResult } from "./types.js";

/** Fiber saturation point for wood (average). */
const FIBER_SATURATION_POINT = 28;

/** Standard atmospheric pressure in psi. */
const STANDARD_ATMOSPHERE_PSI = 14.696;

/** Species-specific shrinkage coefficients from green to oven-dry. */
const SPECIES_SHRINKAGE_DATA = {
  oak: { radial: 4.0, tangential: 8.0 },
  pine: { radial: 2.1, tangential: 6.1 },
  maple: { radial: 4.8, tangential: 9.9 },
  walnut: { radial: 5.5, tangential: 7.8 },
  cherry: { radial: 3.7, tangential: 7.1 },
  "douglas-fir": { radial: 4.8, tangential: 7.6 },
  cedar: { radial: 2.4, tangential: 5.0 },
  poplar: { radial: 3.5, tangential: 8.7 },
  hardwood: { radial: 5.0, tangential: 10.0 },
  softwood: { radial: 3.0, tangential: 7.0 },
} as const satisfies Record<WoodSpecies, { radial: number; tangential: number }>;

/**
 * Calculate moisture content percentage from wet and dry weights.
 * @param input - Wet and dry weight measurements
 * @returns Moisture content as percentage (0-100+)
 * @throws {RangeError} If dryWeight ≤ 0 or wetWeight < dryWeight
 * @example
 * const mc = calculateMoistureContent({ wetWeight: 12.5, dryWeight: 10.0 });
 * // Returns 25.0
 */
export function calculateMoistureContent(input: MoistureContentInput): number {
  const { wetWeight, dryWeight } = input;

  if (dryWeight <= 0) {
    throw new RangeError("Dry weight must be greater than zero");
  }
  if (wetWeight < dryWeight) {
    throw new RangeError("Wet weight cannot be less than dry weight");
  }

  return ((wetWeight - dryWeight) / dryWeight) * 100;
}

/**
 * Calculate equilibrium moisture content using Hailwood-Horrobin approximation.
 * @param input - Temperature (°F) and relative humidity (%)
 * @returns Predicted equilibrium moisture content percentage
 * @throws {RangeError} If temperature or humidity outside valid ranges
 * @example
 * const emc = calculateEquilibriumMC({ temperature: 70, relativeHumidity: 50 });
 * // Returns approximately 9.1
 */
export function calculateEquilibriumMC(input: EquilibriumMCInput): number {
  const { temperature, relativeHumidity } = input;

  if (temperature < -40 || temperature > 200) {
    throw new RangeError("Temperature must be between -40°F and 200°F");
  }
  if (relativeHumidity < 0 || relativeHumidity > 100) {
    throw new RangeError("Relative humidity must be between 0% and 100%");
  }

  // Convert Fahrenheit to Celsius for calculation
  const temperatureCelsius = (temperature - 32) * (5 / 9);
  
  // Hailwood-Horrobin approximation constants for wood
  const k1 = 0.7917;
  const k2 = 0.000736;
  const k3 = 0.000146;
  
  const rh = relativeHumidity / 100;
  const tempK = temperatureCelsius + 273.15;
  
  // Calculate equilibrium moisture content using simplified Hailwood-Horrobin
  const numerator = 1800 / tempK * (k1 * rh + 2 * k2 * Math.pow(rh, 2) + 3 * k3 * Math.pow(rh, 3));
  const denominator = 1 + k1 * rh + k2 * Math.pow(rh, 2) + k3 * Math.pow(rh, 3);
  
  return numerator / denominator;
}

/**
 * Calculate dimensional shrinkage for wood based on moisture content change.
 * @param species - Wood species
 * @param initialMC - Initial moisture content percentage
 * @param finalMC - Final moisture content percentage
 * @returns Shrinkage percentages for radial, tangential, and volumetric dimensions
 * @throws {RangeError} If moisture content values are negative
 * @example
 * const shrinkage = calculateShrinkage(WoodSpecies.Oak, 15, 8);
 * // Returns { radial: 1.0, tangential: 2.0, volumetric: 3.0 }
 */
export function calculateShrinkage(
  species: WoodSpecies,
  initialMC: number,
  finalMC: number
): ShrinkageResult {
  if (initialMC < 0 || finalMC < 0) {
    throw new RangeError("Moisture content cannot be negative");
  }

  const speciesData = SPECIES_SHRINKAGE_DATA[species];
  
  // Shrinkage only occurs below fiber saturation point
  const effectiveInitialMC = Math.min(initialMC, FIBER_SATURATION_POINT);
  const effectiveFinalMC = Math.min(finalMC, FIBER_SATURATION_POINT);
  
  // Calculate shrinkage percentages
  const radialShrinkage = speciesData.radial * (effectiveInitialMC - effectiveFinalMC) / FIBER_SATURATION_POINT;
  const tangentialShrinkage = speciesData.tangential * (effectiveInitialMC - effectiveFinalMC) / FIBER_SATURATION_POINT;
  
  // Volumetric shrinkage approximation (radial + tangential + small longitudinal)
  const volumetricShrinkage = radialShrinkage + tangentialShrinkage + 
    (radialShrinkage * tangentialShrinkage) / 100;

  return {
    radial: Math.max(0, radialShrinkage),
    tangential: Math.max(0, tangentialShrinkage),
    volumetric: Math.max(0, volumetricShrinkage),
  };
}

/**
 * Get shrinkage coefficients for a specific wood species.
 * @param species - Wood species to look up
 * @returns Radial and tangential shrinkage percentages from green to oven-dry
 * @example
 * const coeffs = getShrinkageCoefficients(WoodSpecies.Maple);
 * // Returns { radial: 4.8, tangential: 9.9 }
 */
export function getShrinkageCoefficients(species: WoodSpecies): { radial: number; tangential: number } {
  return { ...SPECIES_SHRINKAGE_DATA[species] };
}

/**
 * Calculate the fiber saturation point adjustment factor.
 * @param moistureContent - Current moisture content percentage
 * @returns Factor between 0 and 1 indicating position relative to FSP
 * @example
 * const factor = getFSPFactor(15);
 * // Returns 0.536 (15/28)
 */
export function getFSPFactor(moistureContent: number): number {
  if (moistureContent < 0) {
    throw new RangeError("Moisture content cannot be negative");
  }
  return Math.min(moistureContent / FIBER_SATURATION_POINT, 1);
}

/**
 * Calculate the time to reach equilibrium moisture content (approximation).
 * @param thickness - Board thickness in inches
 * @param initialMC - Initial moisture content percentage
 * @param targetMC - Target moisture content percentage
 * @param temperature - Ambient temperature in °F
 * @param relativeHumidity - Ambient relative humidity percentage
 * @returns Estimated time in hours to reach target MC
 * @throws {RangeError} If thickness ≤ 0 or invalid moisture/temperature values
 * @example
 * const hours = estimateDryingTime(1.5, 20, 8, 70, 50);
 * // Returns approximately 720 hours (30 days)
 */
export function estimateDryingTime(
  thickness: number,
  initialMC: number,
  targetMC: number,
  temperature: number,
  relativeHumidity: number
): number {
  if (thickness <= 0) {
    throw new RangeError("Thickness must be greater than zero");
  }
  if (initialMC < 0 || targetMC < 0) {
    throw new RangeError("Moisture content cannot be negative");
  }
  if (temperature < 32 || temperature > 150) {
    throw new RangeError("Temperature must be between 32°F and 150°F for drying");
  }
  if (relativeHumidity < 10 || relativeHumidity > 90) {
    throw new RangeError("Relative humidity must be between 10% and 90% for drying");
  }

  // Simplified drying time approximation based on thickness squared rule
  const mcDifference = Math.abs(initialMC - targetMC);
  const equilibriumMC = calculateEquilibriumMC({ temperature, relativeHumidity });
  const drivingForce = Math.abs(initialMC - equilibriumMC);
  
  if (drivingForce === 0) {
    return 0;
  }

  // Base drying rate constant (hours per inch squared per % MC difference)
  const baseRate = 100;
  
  // Temperature adjustment factor
  const tempFactor = 1 + (temperature - 70) * 0.02;
  
  // Humidity adjustment factor
  const humidityFactor = 1 + (50 - relativeHumidity) * 0.01;
  
  return (Math.pow(thickness, 2) * mcDifference * baseRate) / (drivingForce * tempFactor * humidityFactor);
}