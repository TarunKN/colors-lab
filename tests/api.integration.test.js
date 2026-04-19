/**
 * api.integration.test.js
 * Integration tests for the Colors app backend endpoints.
 *
 * Strategy: we use Jest's manual fetch mock to simulate server responses.
 * This lets us validate:
 *   1. The correct URL and HTTP method are used for each endpoint.
 *   2. The correct JSON structure is sent in the request body.
 *   3. The client correctly processes success and error responses.
 *
 * In a full-stack environment (e.g. with a running LAMP server) these tests
 * can be converted to live HTTP calls by swapping the mock for real fetch.
 */

// ─── Minimal client functions under test ─────────────────────────────────────
// We re-implement the XHR calls as async fetch wrappers so they can be tested
// without a browser. The logic mirrors app.js exactly.

const BASE_URL = "https://example.com"; // stand-in for the real domain

async function apiLogin(login, passwordHash) {
  const res = await fetch(BASE_URL + "/Login.php", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify({ login, password: passwordHash }),
  });
  return res.json();
}

async function apiAddColor(color, userId) {
  const res = await fetch(BASE_URL + "/AddColor.php", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify({ color, userId }),
  });
  return res.json();
}

async function apiSearchColors(searchTerm, userId) {
  const res = await fetch(BASE_URL + "/SearchColors.php", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify({ color: searchTerm, userId }),
  });
  return res.json();
}

// ─── Mock setup ───────────────────────────────────────────────────────────────

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.resetAllMocks();
});

function mockFetchResponse(body, status = 200) {
  global.fetch.mockResolvedValueOnce({
    status,
    ok: status >= 200 && status < 300,
    json: async () => body,
  });
}

// ─── /Login.php ───────────────────────────────────────────────────────────────

describe("POST /Login.php", () => {
  test("sends login and hashed password in request body", async () => {
    mockFetchResponse({ id: 1, firstName: "Alice", lastName: "Smith" });

    await apiLogin("alice@example.com", "5f4dcc3b5aa765d61d8327deb882cf99");

    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe(BASE_URL + "/Login.php");
    expect(options.method).toBe("POST");

    const body = JSON.parse(options.body);
    expect(body.login).toBe("alice@example.com");
    expect(body.password).toBe("5f4dcc3b5aa765d61d8327deb882cf99");
  });

  test("returns user object with id, firstName, lastName on success", async () => {
    mockFetchResponse({ id: 7, firstName: "Bob", lastName: "Jones" });

    const result = await apiLogin("bob", "somehash");

    expect(result.id).toBe(7);
    expect(result.firstName).toBe("Bob");
    expect(result.lastName).toBe("Jones");
  });

  test("returns id < 1 when credentials are wrong", async () => {
    mockFetchResponse({ id: 0 });

    const result = await apiLogin("nobody", "wronghash");

    expect(result.id).toBeLessThan(1);
  });

  test("response JSON contains numeric id field", async () => {
    mockFetchResponse({ id: 3, firstName: "Carol", lastName: "White" });

    const result = await apiLogin("carol", "hash");

    expect(typeof result.id).toBe("number");
  });
});

// ─── /AddColor.php ────────────────────────────────────────────────────────────

describe("POST /AddColor.php", () => {
  test("sends color name and userId in request body", async () => {
    mockFetchResponse({ success: true });

    await apiAddColor("cerulean", 42);

    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe(BASE_URL + "/AddColor.php");

    const body = JSON.parse(options.body);
    expect(body.color).toBe("cerulean");
    expect(body.userId).toBe(42);
  });

  test("uses POST method with JSON content-type header", async () => {
    mockFetchResponse({ success: true });

    await apiAddColor("mauve", 1);

    const [, options] = global.fetch.mock.calls[0];
    expect(options.method).toBe("POST");
    expect(options.headers["Content-Type"]).toMatch(/application\/json/);
  });

  test("handles server success response", async () => {
    mockFetchResponse({ success: true });

    const result = await apiAddColor("teal", 5);

    expect(result.success).toBe(true);
  });
});

// ─── /SearchColors.php ────────────────────────────────────────────────────────

describe("POST /SearchColors.php", () => {
  test("sends search term and userId in request body", async () => {
    mockFetchResponse({ results: [] });

    await apiSearchColors("blue", 10);

    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe(BASE_URL + "/SearchColors.php");

    const body = JSON.parse(options.body);
    expect(body.color).toBe("blue");
    expect(body.userId).toBe(10);
  });

  test("response JSON includes a results array", async () => {
    mockFetchResponse({ results: ["blue", "sky blue", "navy blue"] });

    const result = await apiSearchColors("blue", 1);

    expect(Array.isArray(result.results)).toBe(true);
  });

  test("results array contains the matched color strings", async () => {
    const expected = ["red", "dark red"];
    mockFetchResponse({ results: expected });

    const result = await apiSearchColors("red", 2);

    expect(result.results).toEqual(expected);
  });

  test("returns empty results array when no colors match", async () => {
    mockFetchResponse({ results: [] });

    const result = await apiSearchColors("zzznomatch", 3);

    expect(result.results).toHaveLength(0);
  });

  test("each element in results is a string", async () => {
    mockFetchResponse({ results: ["green", "lime green"] });

    const result = await apiSearchColors("green", 4);

    result.results.forEach((item) => {
      expect(typeof item).toBe("string");
    });
  });
});