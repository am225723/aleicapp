/**
 * Fuzzy Match Utility for Love Map Quiz Scoring
 * Implements Bigram Dice Coefficient and Token Jaccard Similarity
 */

/**
 * Normalize a string for comparison:
 * - lowercase
 * - trim whitespace
 * - collapse multiple spaces to single space
 * - remove punctuation and symbols
 */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "") // remove punctuation
    .replace(/\s+/g, " "); // collapse whitespace
}

/**
 * Generate character bigrams from a string (spaces removed)
 */
export function getBigrams(s: string): Set<string> {
  const normalized = normalize(s).replace(/\s/g, "");
  const bigrams = new Set<string>();
  
  for (let i = 0; i < normalized.length - 1; i++) {
    bigrams.add(normalized.substring(i, i + 2));
  }
  
  return bigrams;
}

/**
 * Tokenize a string into words
 */
export function getTokens(s: string): Set<string> {
  const normalized = normalize(s);
  const tokens = normalized.split(" ").filter((t) => t.length > 0);
  return new Set(tokens);
}

/**
 * Calculate set intersection
 */
function setIntersection<T>(a: Set<T>, b: Set<T>): Set<T> {
  const result = new Set<T>();
  for (const item of a) {
    if (b.has(item)) {
      result.add(item);
    }
  }
  return result;
}

/**
 * Calculate set union
 */
function setUnion<T>(a: Set<T>, b: Set<T>): Set<T> {
  const result = new Set<T>(a);
  for (const item of b) {
    result.add(item);
  }
  return result;
}

/**
 * Bigram Dice Coefficient
 * dice = (2 * |B(a) ∩ B(b)|) / (|B(a)| + |B(b)|)
 */
export function bigramDice(a: string, b: string): number {
  const bigramsA = getBigrams(a);
  const bigramsB = getBigrams(b);
  
  if (bigramsA.size === 0 && bigramsB.size === 0) {
    return 1; // Both empty = match
  }
  
  if (bigramsA.size === 0 || bigramsB.size === 0) {
    return 0; // One empty = no match
  }
  
  const intersection = setIntersection(bigramsA, bigramsB);
  return (2 * intersection.size) / (bigramsA.size + bigramsB.size);
}

/**
 * Token Jaccard Similarity
 * jaccard = |T(a) ∩ T(b)| / |T(a) ∪ T(b)|
 */
export function tokenJaccard(a: string, b: string): number {
  const tokensA = getTokens(a);
  const tokensB = getTokens(b);
  
  if (tokensA.size === 0 && tokensB.size === 0) {
    return 1; // Both empty = match
  }
  
  if (tokensA.size === 0 || tokensB.size === 0) {
    return 0; // One empty = no match
  }
  
  const intersection = setIntersection(tokensA, tokensB);
  const union = setUnion(tokensA, tokensB);
  
  return intersection.size / union.size;
}

/**
 * Fuzzy match using combined metrics
 * Match condition: (dice >= 0.80) OR (jaccard >= 0.75)
 */
export function fuzzyMatch(a: string, b: string): boolean {
  const dice = bigramDice(a, b);
  const jaccard = tokenJaccard(a, b);
  
  return dice >= 0.8 || jaccard >= 0.75;
}

/**
 * Get similarity scores for debugging/display
 */
export function getSimilarityScores(a: string, b: string): {
  dice: number;
  jaccard: number;
  isMatch: boolean;
} {
  const dice = bigramDice(a, b);
  const jaccard = tokenJaccard(a, b);
  
  return {
    dice,
    jaccard,
    isMatch: dice >= 0.8 || jaccard >= 0.75,
  };
}
