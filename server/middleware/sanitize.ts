/**
 * Input sanitization utilities for the service layer.
 * Strips HTML tags and enforces maximum string length.
 */

const HTML_TAG_REGEX = /<[^>]*>/g;
const MAX_STRING_LENGTH = 1000;

/**
 * Sanitizes a string by stripping HTML tags and limiting length.
 * @param input - The raw string input to sanitize
 * @returns The sanitized string with HTML tags removed and length capped at 1000 characters
 */
export function sanitizeString(input: string): string {
  return input.replace(HTML_TAG_REGEX, "").slice(0, MAX_STRING_LENGTH);
}
