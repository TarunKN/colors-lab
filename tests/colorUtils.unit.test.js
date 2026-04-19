/**
 * colorUtils.unit.test.js
 * Unit tests for the pure helper functions in colorUtils.js.
 *
 * These tests run entirely in-process — no network, no DOM.
 */

const {
  buildCookieValue,
  parseCookieString,
  isValidColorName,
  normalizeColor,
  buildAddColorPayload,
  buildSearchPayload,
} = require("../src/colorUtils");

// --- parseCookieString --------------------------------------------------------

describe("parseCookieString()", () => {
  test("parses a well-formed cookie string", () => {
    const cookie =
      "firstName=Jane,lastName=Doe,userId=42;expires=Thu, 01 Jan 2030 00:00:00 GMT";
    const result = parseCookieString(cookie);
    expect(result).toEqual({ firstName: "Jane", lastName: "Doe", userId: 42 });
  });

  test("returns null when userId key is absent", () => {
    const cookie = "firstName=Jane,lastName=Doe";
    expect(parseCookieString(cookie)).toBeNull();
  });

  test("returns null when userId is negative (mirrors app.js userId < 0 guard)", () => {
    // app.js readCookie() initialises userId to -1 and redirects when userId < 0.
    // A stored value of -1 therefore triggers a redirect.
    expect(parseCookieString("firstName=A,lastName=B,userId=-1")).toBeNull();
  });

  test("userId=0 is returned as-is (login guard is handled separately)", () => {
    // readCookie() uses < 0 as the redirect sentinel.
    // userId=0 means the login failed but the cookie was still written;
    // the calling page (doLogin) handles the id < 1 check independently.
    const result = parseCookieString("firstName=A,lastName=B,userId=0");
    expect(result).not.toBeNull();
    expect(result.userId).toBe(0);
  });

  test("parses a clean cookie without extra whitespace", () => {
    const cookie = "firstName=Alice,lastName=Smith,userId=7";
    const result = parseCookieString(cookie);
    expect(result).not.toBeNull();
    expect(result.userId).toBe(7);
    expect(result.firstName).toBe("Alice");
    expect(result.lastName).toBe("Smith");
  });

  test("returns null for an empty string", () => {
    expect(parseCookieString("")).toBeNull();
  });

  test("strips the ;expires tail before parsing", () => {
    const cookie = "firstName=Bob,lastName=Lee,userId=3;expires=Mon, 01 Jan 2040 00:00:00 GMT";
    const result = parseCookieString(cookie);
    expect(result).not.toBeNull();
    expect(result.userId).toBe(3);
  });
});

// --- buildCookieValue ---------------------------------------------------------

describe("buildCookieValue()", () => {
  test("produces a round-trip-parseable cookie string", () => {
    const value = buildCookieValue("Bob", "Jones", 5, "Thu, 01 Jan 2030 00:00:00 GMT");
    const parsed = parseCookieString(value);
    expect(parsed).toEqual({ firstName: "Bob", lastName: "Jones", userId: 5 });
  });

  test("includes the expires segment after a semicolon", () => {
    const expires = "Thu, 01 Jan 2030 00:00:00 GMT";
    const value = buildCookieValue("X", "Y", 1, expires);
    expect(value).toContain(";expires=" + expires);
  });
});

// --- isValidColorName ---------------------------------------------------------

describe("isValidColorName()", () => {
  test("accepts simple lowercase color names", () => {
    expect(isValidColorName("red")).toBe(true);
  });

  test("accepts mixed-case names", () => {
    expect(isValidColorName("Blue")).toBe(true);
  });

  test("accepts names with internal spaces", () => {
    expect(isValidColorName("sky blue")).toBe(true);
  });

  test("accepts hyphenated names", () => {
    expect(isValidColorName("sky-blue")).toBe(true);
  });

  test("accepts alphanumeric names like design-system tokens", () => {
    expect(isValidColorName("Red 500")).toBe(true);
  });

  test("rejects an empty string", () => {
    expect(isValidColorName("")).toBe(false);
  });

  test("rejects a whitespace-only string", () => {
    expect(isValidColorName("   ")).toBe(false);
  });

  test("rejects hex color codes", () => {
    expect(isValidColorName("#ff0000")).toBe(false);
  });

  test("rejects names with exclamation marks", () => {
    expect(isValidColorName("red!")).toBe(false);
  });

  test("rejects script injection attempts", () => {
    expect(isValidColorName("<script>")).toBe(false);
  });

  test("rejects null", () => {
    expect(isValidColorName(null)).toBe(false);
  });

  test("rejects undefined", () => {
    expect(isValidColorName(undefined)).toBe(false);
  });
});

// --- normalizeColor -----------------------------------------------------------

describe("normalizeColor()", () => {
  test("trims leading and trailing whitespace", () => {
    expect(normalizeColor("  red  ")).toBe("red");
  });

  test("lowercases the input", () => {
    expect(normalizeColor("SkyBlue")).toBe("skyblue");
  });

  test("lowercases multi-word input", () => {
    expect(normalizeColor("DARK GREEN")).toBe("dark green");
  });

  test("returns empty string for null", () => {
    expect(normalizeColor(null)).toBe("");
  });

  test("returns empty string for undefined", () => {
    expect(normalizeColor(undefined)).toBe("");
  });
});

// --- buildAddColorPayload -----------------------------------------------------

describe("buildAddColorPayload()", () => {
  test("produces valid JSON with color and userId fields", () => {
    const payload = buildAddColorPayload("teal", 3);
    const parsed = JSON.parse(payload);
    expect(parsed).toEqual({ color: "teal", userId: 3 });
  });

  test("preserves the color name exactly as supplied", () => {
    const payload = buildAddColorPayload("Midnight Blue", 1);
    expect(JSON.parse(payload).color).toBe("Midnight Blue");
  });
});

// --- buildSearchPayload -------------------------------------------------------

describe("buildSearchPayload()", () => {
  test("produces valid JSON with color search term and userId", () => {
    const payload = buildSearchPayload("green", 9);
    const parsed = JSON.parse(payload);
    expect(parsed).toEqual({ color: "green", userId: 9 });
  });

  test("uses the key 'color' for the search term (matches SearchColors.php expectation)", () => {
    const payload = buildSearchPayload("blue", 1);
    expect(JSON.parse(payload)).toHaveProperty("color");
  });

  test("allows an empty search term for open-ended searches", () => {
    const payload = buildSearchPayload("", 2);
    expect(JSON.parse(payload).color).toBe("");
  });
});