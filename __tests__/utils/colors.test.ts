import { Colors } from "../../utils/colors";

describe("Colors", () => {
  it("has black as #000000", () => {
    expect(Colors.black).toBe("#000000");
  });

  it("has white as #FFFFFF", () => {
    expect(Colors.white).toBe("#FFFFFF");
  });

  it("has all gray shades defined", () => {
    expect(Colors.gray100).toBeDefined();
    expect(Colors.gray200).toBeDefined();
    expect(Colors.gray300).toBeDefined();
    expect(Colors.gray400).toBeDefined();
    expect(Colors.gray500).toBeDefined();
    expect(Colors.gray600).toBeDefined();
    expect(Colors.gray700).toBeDefined();
  });

  it("all values are valid hex colors", () => {
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    for (const value of Object.values(Colors)) {
      expect(value).toMatch(hexRegex);
    }
  });

  it("grays progress from dark to light", () => {
    const grays = [Colors.gray100, Colors.gray200, Colors.gray300, Colors.gray400, Colors.gray500, Colors.gray600, Colors.gray700];
    const values = grays.map((hex) => parseInt(hex.slice(1), 16));
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThan(values[i - 1]);
    }
  });
});
