import { describe, it, expect } from "bun:test";
import {
  calculateJoineryStrength,
  getSpeciesData,
  compareJoints,
  JoineryType,
  WoodSpecies,
  RangeError,
} from "../src/index.js";

describe("Joinery Strength Calculator", () => {
  describe("calculateJoineryStrength", () => {
    it("calculates mortise-tenon strength for Oak", () => {
      const result = calculateJoineryStrength({
        joineryType: JoineryType.MortiseTenon,
        species: WoodSpecies.Oak,
        jointWidth: 2,
        jointDepth: 3,
        glueArea: 12,
        reinforced: false,
      });

      // Wood: 1780 * 2 * 3 * 0.80 = 8544
      // Glue: 3500 * 12 * 0.5 = 21000
      // Total = 29544
      expect(result.estimatedStrength).toBeCloseTo(29544, 0);
      expect(result.strengthFactor).toBe(0.80);
      expect(result.maxRecommendedLoad).toBeCloseTo(29544 / 3, 0);
      expect(result.failureMode).toBe(
        "Tenon shear or mortise wall splitting",
      );
    });

    it("calculates dovetail strength for Maple", () => {
      const result = calculateJoineryStrength({
        joineryType: JoineryType.Dovetail,
        species: WoodSpecies.Maple,
        jointWidth: 3,
        jointDepth: 1,
        glueArea: 8,
        reinforced: false,
      });

      // Wood: 2330 * 3 * 1 * 0.85 = 5941.5
      // Glue: 3500 * 8 * 0.5 = 14000
      // Total = 19941.5
      expect(result.estimatedStrength).toBeCloseTo(19941.5, 0);
      expect(result.strengthFactor).toBe(0.85);
      expect(result.failureMode).toBe(
        "Pin shear or socket splitting along grain",
      );
    });

    it("applies reinforcement bonus when reinforced is true", () => {
      const base = calculateJoineryStrength({
        joineryType: JoineryType.Dowel,
        species: WoodSpecies.Pine,
        jointWidth: 2,
        jointDepth: 2,
        glueArea: 6,
        reinforced: false,
      });

      const reinforced = calculateJoineryStrength({
        joineryType: JoineryType.Dowel,
        species: WoodSpecies.Pine,
        jointWidth: 2,
        jointDepth: 2,
        glueArea: 6,
        reinforced: true,
      });

      expect(reinforced.estimatedStrength).toBeCloseTo(
        base.estimatedStrength * 1.35,
        0,
      );
    });

    it("butt joint is weakest type", () => {
      const butt = calculateJoineryStrength({
        joineryType: JoineryType.ButtJoint,
        species: WoodSpecies.Oak,
        jointWidth: 2,
        jointDepth: 2,
        glueArea: 4,
        reinforced: false,
      });

      const dovetail = calculateJoineryStrength({
        joineryType: JoineryType.Dovetail,
        species: WoodSpecies.Oak,
        jointWidth: 2,
        jointDepth: 2,
        glueArea: 4,
        reinforced: false,
      });

      expect(butt.estimatedStrength).toBeLessThan(
        dovetail.estimatedStrength,
      );
    });

    it("throws RangeError for zero joint width", () => {
      expect(() =>
        calculateJoineryStrength({
          joineryType: JoineryType.LapJoint,
          species: WoodSpecies.Pine,
          jointWidth: 0,
          jointDepth: 2,
          glueArea: 4,
          reinforced: false,
        }),
      ).toThrow(RangeError);
    });

    it("throws RangeError for negative joint depth", () => {
      expect(() =>
        calculateJoineryStrength({
          joineryType: JoineryType.BoxJoint,
          species: WoodSpecies.Walnut,
          jointWidth: 2,
          jointDepth: -1,
          glueArea: 4,
          reinforced: false,
        }),
      ).toThrow(RangeError);
    });

    it("throws RangeError for negative glue area", () => {
      expect(() =>
        calculateJoineryStrength({
          joineryType: JoineryType.Biscuit,
          species: WoodSpecies.Cherry,
          jointWidth: 2,
          jointDepth: 2,
          glueArea: -5,
          reinforced: false,
        }),
      ).toThrow(RangeError);
    });

    it("works with zero glue area (dry-fit only)", () => {
      const result = calculateJoineryStrength({
        joineryType: JoineryType.PocketHole,
        species: WoodSpecies.Cedar,
        jointWidth: 1.5,
        jointDepth: 1.5,
        glueArea: 0,
        reinforced: true,
      });

      // Wood only: 990 * 1.5 * 1.5 * 0.50 * 1.35 = 1504.6875
      expect(result.estimatedStrength).toBeCloseTo(1504.69, 0);
      expect(result.maxRecommendedLoad).toBeLessThan(
        result.estimatedStrength,
      );
    });
  });

  describe("getSpeciesData", () => {
    it("returns mechanical properties for Oak", () => {
      const data = getSpeciesData(WoodSpecies.Oak);
      expect(data.species).toBe(WoodSpecies.Oak);
      expect(data.specificGravity).toBe(0.6);
      expect(data.shearStrength).toBe(1780);
      expect(data.modulusOfRupture).toBe(14300);
    });

    it("returns a copy (not a reference)", () => {
      const a = getSpeciesData(WoodSpecies.Pine);
      const b = getSpeciesData(WoodSpecies.Pine);
      expect(a).toEqual(b);
      expect(a).not.toBe(b);
    });
  });

  describe("compareJoints", () => {
    it("returns all joint types sorted by strength descending", () => {
      const ranked = compareJoints(WoodSpecies.Oak, 2, 3, 10);

      expect(ranked.length).toBe(8); // 8 joint types
      // First should be strongest (Dovetail), last should be weakest (ButtJoint)
      expect(ranked[0].joineryType).toBe(JoineryType.Dovetail);
      expect(ranked[ranked.length - 1].joineryType).toBe(
        JoineryType.ButtJoint,
      );

      // Verify descending order
      for (let i = 1; i < ranked.length; i++) {
        expect(
          ranked[i - 1].result.estimatedStrength,
        ).toBeGreaterThanOrEqual(ranked[i].result.estimatedStrength);
      }
    });

    it("throws RangeError for invalid dimensions", () => {
      expect(() => compareJoints(WoodSpecies.Maple, 0, 2, 5)).toThrow(
        RangeError,
      );
    });
  });
});
