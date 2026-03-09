import { Filter } from "bad-words";

const filter = new Filter();

// Add equine-industry-specific false positives to the allow list
filter.removeWords("stallion", "mare", "gelding", "stud", "dam", "ass", "mount", "ride", "rider", "breeding", "bred", "colt", "filly", "bitch");

/**
 * Check text for profanity. Returns { clean: boolean, filtered: string }.
 * The filtered string has profanity replaced with asterisks.
 */
export function checkProfanity(text: string): { clean: boolean; filtered: string } {
  if (!text || text.trim().length === 0) return { clean: true, filtered: text };
  try {
    const filtered = filter.clean(text);
    return { clean: filtered === text, filtered };
  } catch {
    // If the filter throws (edge cases), allow the text through
    return { clean: true, filtered: text };
  }
}

/**
 * Check multiple fields for profanity. Returns the first field name that fails, or null if all clean.
 */
export function checkFieldsProfanity(fields: Record<string, string | undefined | null>): string | null {
  for (const [name, value] of Object.entries(fields)) {
    if (value && !checkProfanity(value).clean) {
      return name;
    }
  }
  return null;
}
