import type { UnitConversion } from './types.js';

export const unitConversions: UnitConversion = {
  inchesToFeet: 0.0833333,
  feetToInches: 12,
  sqInchesToSqFeet: 0.00694444,
  sqFeetToSqInches: 144,
  boardFeetToCubicInches: 144,
  cubicInchesToBoardFeet: 0.00694444
};

export function inchesToCentimeters(inches: number): number {
  if (inches < 0) throw new RangeError('Inches must be non-negative');
  return Number((inches * 2.54).toFixed(4));
}

export function centimetersToInches(cm: number): number {
  if (cm < 0) throw new RangeError('Centimeters must be non-negative');
  return Number((cm / 2.54).toFixed(4));
}

export function boardFeetToCubicMeters(boardFeet: number): number {
  if (boardFeet < 0) throw new RangeError('Board feet must be non-negative');
  return Number((boardFeet * 0.00235974).toFixed(6));
}

export function cubicMetersToBoardFeet(cubicMeters: number): number {
  if (cubicMeters < 0) throw new RangeError('Cubic meters must be non-negative');
  return Number((cubicMeters / 0.00235974).toFixed(2));
}

export function poundsPerSquareInchToKilopascals(psi: number): number {
  if (psi < 0) throw new RangeError('PSI must be non-negative');
  return Number((psi * 6.89476).toFixed(2));
}

export function kilopascalsToPoundsPerSquareInch(kpa: number): number {
  if (kpa < 0) throw new RangeError('Kilopascals must be non-negative');
  return Number((kpa / 6.89476).toFixed(2));
}