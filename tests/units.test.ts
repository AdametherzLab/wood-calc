import { describe, it, expect } from 'bun:test';
import {
  inchesToCentimeters,
  centimetersToInches,
  boardFeetToCubicMeters,
  cubicMetersToBoardFeet,
  poundsPerSquareInchToKilopascals,
  kilopascalsToPoundsPerSquareInch,
  RangeError
} from '../src/units.js';

describe('Unit Conversions', () => {
  describe('Linear Measurements', () => {
    it('converts inches to centimeters', () => {
      expect(inchesToCentimeters(12)).toBeCloseTo(30.48);
      expect(inchesToCentimeters(1)).toBeCloseTo(2.54);
    });

    it('converts centimeters to inches', () => {
      expect(centimetersToInches(30.48)).toBeCloseTo(12);
      expect(centimetersToInches(2.54)).toBeCloseTo(1);
    });

    it('throws RangeError for negative values', () => {
      expect(() => inchesToCentimeters(-1)).toThrow(RangeError);
      expect(() => centimetersToInches(-2.54)).toThrow(RangeError);
    });
  });

  describe('Volume Conversions', () => {
    it('converts board feet to cubic meters', () => {
      expect(boardFeetToCubicMeters(100)).toBeCloseTo(0.235974);
      expect(boardFeetToCubicMeters(1)).toBeCloseTo(0.00235974);
    });

    it('converts cubic meters to board feet', () => {
      expect(cubicMetersToBoardFeet(1)).toBeCloseTo(423.776);
      expect(cubicMetersToBoardFeet(0.235974)).toBeCloseTo(100);
    });

    it('throws RangeError for negative values', () => {
      expect(() => boardFeetToCubicMeters(-1)).toThrow(RangeError);
      expect(() => cubicMetersToBoardFeet(-0.5)).toThrow(RangeError);
    });
  });

  describe('Pressure Conversions', () => {
    it('converts PSI to kilopascals', () => {
      expect(poundsPerSquareInchToKilopascals(1)).toBeCloseTo(6.89);
      expect(poundsPerSquareInchToKilopascals(100)).toBeCloseTo(689.476);
    });

    it('converts kilopascals to PSI', () => {
      expect(kilopascalsToPoundsPerSquareInch(6.89476)).toBeCloseTo(1);
      expect(kilopascalsToPoundsPerSquareInch(689.476)).toBeCloseTo(100);
    });

    it('throws RangeError for negative values', () => {
      expect(() => poundsPerSquareInchToKilopascals(-5)).toThrow(RangeError);
      expect(() => kilopascalsToPoundsPerSquareInch(-10)).toThrow(RangeError);
    });
  });
});