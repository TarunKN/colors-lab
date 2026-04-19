/**
 * colorUtils.js
 * Pure helper functions extracted from the Colors app for unit testing.
 * These are the same functions used in app.js — no DOM or XHR dependencies.
 */

/**
 * Serializes user data into the cookie string format used by saveCookie().
 * Format: "firstName=<v>,lastName=<v>,userId=<v>;expires=<date>"
 */
function buildCookieValue(firstName, lastName, userId, expiresDate) {
  return (
    "firstName=" + firstName +
    ",lastName=" + lastName +
    ",userId=" + userId +
    ";expires=" + expiresDate
  );
}

/**
 * Parses the cookie string used by readCookie().
 * Returns { firstName, lastName, userId } or null if userId is missing/invalid.
 *
 * Mirrors the exact split + token logic in readCookie() so the unit test
 * validates the real parsing behaviour.
 */
function parseCookieString(cookieStr) {
  let userId = -1;
  let firstName = "";
  let lastName = "";

  // Strip the ";expires=..." tail before splitting on ","
  const bare = cookieStr.split(";")[0];
  const splits = bare.split(",");

  for (let i = 0; i < splits.length; i++) {
    const thisOne = splits[i].trim();
    const tokens = thisOne.split("=");
    if (tokens[0] === "firstName") {
      firstName = tokens[1];
    } else if (tokens[0] === "lastName") {
      lastName = tokens[1];
    } else if (tokens[0] === "userId") {
      userId = parseInt(tokens[1].trim());
    }
  }

  if (userId < 0) return null;
  return { firstName, lastName, userId };
}

/**
 * Validates a color name before submission.
 * Returns true only for non-empty strings composed of letters, spaces,
 * hyphens, and digits (e.g. "sky-blue", "Red 500").
 */
function isValidColorName(color) {
  if (!color || typeof color !== "string") return false;
  const trimmed = color.trim();
  if (trimmed.length === 0) return false;
  return /^[a-zA-Z0-9\s-]+$/.test(trimmed);  // Fixed: Removed unnecessary escape for '-'
}

/**
 * Normalizes a color name for storage: trims whitespace and lowercases.
 */
function normalizeColor(color) {
  if (!color || typeof color !== "string") return "";
  return color.trim().toLowerCase();
}

/**
 * Builds the JSON payload sent by addColor().
 */
function buildAddColorPayload(color, userId) {
  return JSON.stringify({ color: color, userId: userId });
}

/**
 * Builds the JSON payload sent by searchColor().
 */
function buildSearchPayload(searchTerm, userId) {
  return JSON.stringify({ color: searchTerm, userId: userId });
}

// Correct export to support ES Modules
export {
  buildCookieValue,
  parseCookieString,
  isValidColorName,
  normalizeColor,
  buildAddColorPayload,
  buildSearchPayload,
};