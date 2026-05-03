import { detectMealType } from "../../utils/mealType";

describe("detectMealType", () => {
  const originalDate = Date;

  afterEach(() => {
    global.Date = originalDate;
  });

  function mockHour(hour: number) {
    global.Date = class extends Date {
      getHours() { return hour; }
    } as any;
  }

  it("returns breakfast before 11", () => {
    mockHour(8);
    expect(detectMealType()).toBe("breakfast");
  });

  it("returns breakfast at 10", () => {
    mockHour(10);
    expect(detectMealType()).toBe("breakfast");
  });

  it("returns lunch at 11", () => {
    mockHour(11);
    expect(detectMealType()).toBe("lunch");
  });

  it("returns lunch at 13", () => {
    mockHour(13);
    expect(detectMealType()).toBe("lunch");
  });

  it("returns snack at 14", () => {
    mockHour(14);
    expect(detectMealType()).toBe("snack");
  });

  it("returns snack at 16", () => {
    mockHour(16);
    expect(detectMealType()).toBe("snack");
  });

  it("returns dinner at 17", () => {
    mockHour(17);
    expect(detectMealType()).toBe("dinner");
  });

  it("returns dinner at 22", () => {
    mockHour(22);
    expect(detectMealType()).toBe("dinner");
  });
});
