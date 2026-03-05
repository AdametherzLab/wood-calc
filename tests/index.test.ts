import { describe, it, expect } from "bun:test";
import {
  calculateBoardFeet,
  calculateLinearFeet,
  calculateSheetCount,
  calculateMoistureContent,
  calculateEquilibriumMC,
  calculateShrinkage,
  WoodSpecies,
  RangeError,
} from "../src/index.js";

describe("wood-calc", () => {
  describe("calculateBoardFeet", () => {
    it("calculates board feet for standard 1x6x8 lumber", () => {
      const result = calculateBoardFeet({
        thickness: 1,
        width: 6,
        length: 96,
        quantity: 1,
      });
      expect(result.value).toBeCloseTo(4.0, 6);
      expect(result.units).toBe("board feet");
      expect(result.input).toEqual({
        thickness: 1,
        width: 6,
        length: 96,
        quantity: 1,
      });
    });

    it("throws RangeError for zero thickness", () => {
      expect(() =>
        calculateBoardFeet({
          thickness: 0,
          width: 6,
          length: 96,
          quantity: 1,
        })
      ).toThrow(RangeError);
    });
  });

  describe("calculateSheetCount", () => {
    it("calculates sheets needed for a project area with default waste factor", () => {
      const result = calculateSheetCount({
        area: 5760,
        sheetWidth: 48,
        sheetLength: 96,
        wasteFactor: 0,
      });
      expect(result.value).toBe(2);
      expect(result.units).toBe("sheets");
      expect(result.input).toEqual({
        area: 5760,
        sheetWidth: 48,
        sheetLength: 96,
        wasteFactor: 0,
      });
    });

    it("throws RangeError for negative waste factor", () => {
      expect(() =>
        calculateSheetCount({
          area: 5760,
          sheetWidth: 48,
          sheetLength: 96,
          wasteFactor: -0.1,
        })
      ).toThrow(RangeError);
    });
  });

  describe("calculateMoistureContent", () => {
    it("calculates moisture content from wet and dry weights", () => {
      const mc = calculateMoistureContent({
        wetWeight: 12.5,
        dryWeight: 10.0,
      });
      expect(mc).toBeCloseTo(25.0, 6);
    });

    it("throws RangeError when dry weight is zero", () => {
      expect(() =>
        calculateMoistureContent({
          wetWeight: 12.5,
          dryWeight: 0,
        })
      ).toThrow(RangeError);
    });
  });

  describe("calculateEquilibriumMC", () => {
    it("calculates equilibrium moisture content at standard conditions", () => {
      const emc = calculateEquilibriumMC({
        temperature: 70,
        relativeHumidity: 65,
      });
      expect(emc).toBeCloseTo(2.08, 2);
    });

    it("throws RangeError for invalid relative humidity", () => {
      expect(() =>
        calculateEquilibriumMC({
          temperature: 70,
          relativeHumidity: 101,
        })
      ).toThrow(RangeError);
    });
  });

  describe("calculateShrinkage", () => {
    it("calculates shrinkage for Oak across moisture content range", () => {
      const shrinkage = calculateShrinkage(
        WoodSpecies.Oak,
        15,
        8
      );
      expect(shrinkage.radial).toBeGreaterThan(0);
      expect(shrinkage.tangential).toBeGreaterThan(0);
      expect(shrinkage.volumetric).toBeGreaterThan(0);
      expect(shrinkage.radial).toBeLessThan(shrinkage.tangential);
    });

    it("throws RangeError for negative moisture content", () => {
      expect(() =>
        calculateShrinkage(WoodSpecies.Oak, -5, 8)
      ).toThrow(RangeError);
    });
  });
});