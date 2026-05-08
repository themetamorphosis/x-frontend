import { Colors } from "../../utils/colors";

describe("Colors", () => {
  it("has black defined", () => {
    expect(Colors.black).toBeDefined();
    expect(typeof Colors.black).toBe("string");
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

  it("hex values are valid hex colors", () => {
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    const hexKeys = ["background", "surface", "surfaceDark", "shadowLight", "shadowDark", "highlight", "shadow", "text", "textSecondary", "textTertiary", "accent", "accentLight", "accentDark", "error", "success", "warning", "black", "white", "gray100", "gray200", "gray300", "gray400", "gray500", "gray600", "gray700"];
    for (const key of hexKeys) {
      expect((Colors as any)[key]).toMatch(hexRegex);
    }
  });

  it("grays progress from light to dark", () => {
    const grays = [Colors.gray100, Colors.gray200, Colors.gray300, Colors.gray400, Colors.gray500, Colors.gray600, Colors.gray700];
    const values = grays.map((hex) => parseInt(hex.slice(1), 16));
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeLessThan(values[i - 1]);
    }
  });
});
