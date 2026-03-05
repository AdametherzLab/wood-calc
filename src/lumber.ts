import type { 
  BoardFeetInput, 
  LinearFeetInput, 
  SheetCountInput, 
  CalculationResult,
  BoardFeet,
  LinearFeet
} from "./types.js";

/**
 * Calculate board feet from lumber dimensions.
 * Formula: (thickness × width × length) ÷ 144 × quantity
 * @param input - Board dimensions and quantity
 * @returns Calculation result with board feet value
 * @throws {RangeError} If any dimension is zero or negative
 * @example
 * const result = calculateBoardFeet({
 *   thickness: 1.5,
 *   width: 3.5,
 *   length: 96,
 *   quantity: 4
 * });
 * // result.value ≈ 14.0 board feet
 */
export function calculateBoardFeet(input: BoardFeetInput): CalculationResult<BoardFeet> {
  const { thickness, width, length, quantity } = input;
  
  if (thickness <= 0) {
    throw new RangeError("Thickness must be greater than zero");
  }
  if (width <= 0) {
    throw new RangeError("Width must be greater than zero");
  }
  if (length <= 0) {
    throw new RangeError("Length must be greater than zero");
  }
  if (quantity <= 0) {
    throw new RangeError("Quantity must be greater than zero");
  }
  
  const warnings: string[] = [];
  if (thickness < 0.25 || thickness > 12) {
    warnings.push("Thickness is outside typical lumber range (0.25-12 inches)");
  }
  if (width < 0.5 || width > 24) {
    warnings.push("Width is outside typical lumber range (0.5-24 inches)");
  }
  if (length < 12 || length > 240) {
    warnings.push("Length is outside typical lumber range (12-240 inches)");
  }
  
  // Board feet formula: (T × W × L) ÷ 144 × quantity
  const boardFeet = (thickness * width * length) / 144 * quantity;
  
  return {
    value: boardFeet as BoardFeet,
    units: "board feet",
    input,
    timestamp: new Date(),
    warnings
  };
}

/**
 * Calculate linear feet from piece length and quantity.
 * @param input - Length in inches and quantity
 * @returns Calculation result with linear feet value
 * @throws {RangeError} If length or quantity is zero or negative
 * @example
 * const result = calculateLinearFeet({
 *   length: 96,
 *   quantity: 6
 * });
 * // result.value = 48 linear feet
 */
export function calculateLinearFeet(input: LinearFeetInput): CalculationResult<LinearFeet> {
  const { length, quantity } = input;
  
  if (length <= 0) {
    throw new RangeError("Length must be greater than zero");
  }
  if (quantity <= 0) {
    throw new RangeError("Quantity must be greater than zero");
  }
  
  const warnings: string[] = [];
  if (length < 12 || length > 240) {
    warnings.push("Length is outside typical lumber range (12-240 inches)");
  }
  
  const linearFeet = (length * quantity) / 12;
  
  return {
    value: linearFeet as LinearFeet,
    units: "linear feet",
    input,
    timestamp: new Date(),
    warnings
  };
}

/**
 * Calculate number of plywood sheets needed for a project.
 * @param input - Project area, sheet dimensions, and waste factor
 * @returns Calculation result with sheet count (rounded up)
 * @throws {RangeError} If any input is invalid
 * @example
 * const result = calculateSheetCount({
 *   area: 5760, // 40 sq ft in square inches
 *   sheetWidth: 48,
 *   sheetLength: 96,
 *   wasteFactor: 0.1
 * });
 * // result.value ≈ 2 sheets
 */
export function calculateSheetCount(input: SheetCountInput): CalculationResult<number> {
  const { area, sheetWidth, sheetLength, wasteFactor } = input;
  
  if (area <= 0) {
    throw new RangeError("Area must be greater than zero");
  }
  if (sheetWidth <= 0) {
    throw new RangeError("Sheet width must be greater than zero");
  }
  if (sheetLength <= 0) {
    throw new RangeError("Sheet length must be greater than zero");
  }
  if (wasteFactor < 0 || wasteFactor > 1) {
    throw new RangeError("Waste factor must be between 0 and 1 (0-100%)");
  }
  
  const warnings: string[] = [];
  if (sheetWidth !== 48 || sheetLength !== 96) {
    warnings.push("Using non-standard sheet dimensions (standard is 48×96 inches)");
  }
  if (wasteFactor > 0.25) {
    warnings.push("Waste factor exceeds 25%, consider optimizing cutting layout");
  }
  
  const sheetArea = sheetWidth * sheetLength;
  const adjustedArea = area * (1 + wasteFactor);
  const sheetCount = Math.ceil(adjustedArea / sheetArea);
  
  return {
    value: sheetCount,
    units: "sheets",
    input,
    timestamp: new Date(),
    warnings
  };
}

/**
 * Calculate board feet for multiple boards with different dimensions.
 * @param boards - Array of board dimension objects
 * @returns Total board feet across all boards
 * @throws {RangeError} If any board has invalid dimensions
 * @example
 * const total = calculateTotalBoardFeet([
 *   { thickness: 1.5, width: 3.5, length: 96, quantity: 4 },
 *   { thickness: 0.75, width: 5.5, length: 48, quantity: 6 }
 * ]);
 */
export function calculateTotalBoardFeet(boards: readonly BoardFeetInput[]): CalculationResult<BoardFeet> {
  if (boards.length === 0) {
    throw new RangeError("At least one board must be provided");
  }
  
  const warnings: string[] = [];
  let totalBoardFeet = 0;
  
  for (const [index, board] of boards.entries()) {
    try {
      const result = calculateBoardFeet(board);
      totalBoardFeet += result.value;
      warnings.push(...result.warnings.map(w => `Board ${index + 1}: ${w}`));
    } catch (error) {
      if (error instanceof RangeError) {
        throw new RangeError(`Board ${index + 1}: ${error.message}`);
      }
      throw error;
    }
  }
  
  return {
    value: totalBoardFeet as BoardFeet,
    units: "board feet",
    input: boards,
    timestamp: new Date(),
    warnings
  };
}

/**
 * Calculate board feet using nominal dimensions (common lumber sizes).
 * @param nominalThickness - Nominal thickness (e.g., 2 for 2×4)
 * @param nominalWidth - Nominal width (e.g., 4 for 2×4)
 * @param length - Length in inches
 * @param quantity - Number of boards
 * @returns Calculation result with board feet using actual dimensions
 * @throws {RangeError} If any input is invalid
 * @example
 * const result = calculateBoardFeetNominal(2, 4, 96, 4);
 * // Uses actual dimensions 1.5" × 3.5" for 2×4
 */
export function calculateBoardFeetNominal(
  nominalThickness: number,
  nominalWidth: number,
  length: number,
  quantity: number
): CalculationResult<BoardFeet> {
  if (nominalThickness <= 0) {
    throw new RangeError("Nominal thickness must be greater than zero");
  }
  if (nominalWidth <= 0) {
    throw new RangeError("Nominal width must be greater than zero");
  }
  
  // Convert nominal dimensions to actual dimensions
  const actualDimensions = convertNominalToActual(nominalThickness, nominalWidth);
  
  return calculateBoardFeet({
    thickness: actualDimensions.thickness,
    width: actualDimensions.width,
    length,
    quantity
  });
}

/**
 * Convert nominal lumber dimensions to actual dimensions.
 * @param nominalThickness - Nominal thickness in inches
 * @param nominalWidth - Nominal width in inches
 * @returns Actual thickness and width in inches
 */
function convertNominalToActual(
  nominalThickness: number,
  nominalWidth: number
): { thickness: number; width: number } {
  // Standard nominal to actual conversions for dressed lumber
  const nominalToActual: Record<number, number> = {
    1: 0.75,
    2: 1.5,
    3: 2.5,
    4: 3.5,
    6: 5.5,
    8: 7.25,
    10: 9.25,
    12: 11.25,
    14: 13.25,
    16: 15.25
  };
  
  const thickness = nominalToActual[nominalThickness] ?? nominalThickness - 0.5;
  const width = nominalToActual[nominalWidth] ?? nominalWidth - 0.5;
  
  return { thickness, width };
}