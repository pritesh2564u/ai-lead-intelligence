import { describe, expect, it } from "vitest";
import { normalizeDomain, nullIfPlaceholder } from "./normalization.js";

describe("normalization", () => {
    it("treats common exporter placeholders as empty", () => {
        for (const placeholder of [
            "N/A",
            "n/a",
            "NA",
            "none",
            "nil",
            "-",
            "unknown",
            "not available",
            "n",
            "N/A ",
        ]) {
            expect(nullIfPlaceholder(placeholder)).toBeNull();
        }
        expect(nullIfPlaceholder("adventisthealth.org")).toBe(
            "adventisthealth.org",
        );
        expect(nullIfPlaceholder("   ")).toBeNull();
    });

    it("returns null domain for placeholder websites", () => {
        expect(normalizeDomain("N/A")).toBeNull();
        expect(normalizeDomain("n")).toBeNull();
        expect(normalizeDomain("none")).toBeNull();
        expect(normalizeDomain("https://www.Example.com/path")).toBe(
            "example.com",
        );
    });
});