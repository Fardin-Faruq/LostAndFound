import { IItem, Item } from '../models/Item';

export interface MatchScoreResult {
  score: number;
  reasons: string[];
}

export interface MatchCandidate {
  lostItem: IItem;
  foundItem: IItem;
  score: number;
  reasons: string[];
}

export interface IMatchingEngine {
  calculateScore(lostItem: IItem, foundItem: IItem): MatchScoreResult;
  findMatchesForUser(userId: string): Promise<MatchCandidate[]>;
  findMatchesForItem(itemId: string): Promise<MatchCandidate[]>;
}

const normalize = (value?: string): string =>
  String(value || '')
    .trim()
    .toLowerCase();

const tokenize = (text?: string): Set<string> => {
  const words = normalize(text)
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2);
  return new Set(words);
};

const calculateTextSimilarity = (text1?: string, text2?: string): number => {
  const tokens1 = tokenize(text1);
  const tokens2 = tokenize(text2);

  if (tokens1.size === 0 || tokens2.size === 0) return 0;

  let common = 0;
  tokens1.forEach((token) => {
    if (tokens2.has(token)) common++;
  });

  const union = new Set([...tokens1, ...tokens2]).size;
  return union === 0 ? 0 : common / union;
};

export class DeterministicMatchingEngine implements IMatchingEngine {
  calculateScore(lostItem: IItem, foundItem: IItem): MatchScoreResult {
    let score = 0;
    const reasons: string[] = [];

    // 1. Category (Weight: 20)
    const lostCat = normalize(lostItem.category);
    const foundCat = normalize(foundItem.category);
    if (lostCat && foundCat && lostCat === foundCat) {
      score += 20;
      reasons.push('Category match');
    }

    // 2. Brand (Weight: 15)
    const lostBrand = normalize(lostItem.brand);
    const foundBrand = normalize(foundItem.brand);
    if (lostBrand && foundBrand && lostBrand === foundBrand) {
      score += 15;
      reasons.push('Brand match');
    }

    // 3. Color (Weight: 10)
    const lostColor = normalize(lostItem.color);
    const foundColor = normalize(foundItem.color);
    if (lostColor && foundColor && (lostColor.includes(foundColor) || foundColor.includes(lostColor))) {
      score += 10;
      reasons.push('Color similarity');
    }

    // 4. Location (Weight: 15)
    const lostLoc = normalize(lostItem.location);
    const foundLoc = normalize(foundItem.location);
    if (lostLoc && foundLoc && (lostLoc.includes(foundLoc) || foundLoc.includes(lostLoc))) {
      score += 15;
      reasons.push('Location match');
    }

    // 5. Date Proximity (Weight: 15)
    if (lostItem.dateLostOrFound && foundItem.dateLostOrFound) {
      const lostDate = new Date(lostItem.dateLostOrFound).getTime();
      const foundDate = new Date(foundItem.dateLostOrFound).getTime();
      const dayDiff = Math.abs(foundDate - lostDate) / (1000 * 60 * 60 * 24);

      if (dayDiff <= 2) {
        score += 15;
        reasons.push('Dates within 2 days');
      } else if (dayDiff <= 5) {
        score += 10;
        reasons.push('Dates within 5 days');
      } else if (dayDiff <= 14) {
        score += 5;
        reasons.push('Dates within 2 weeks');
      }
    }

    // 6. Text Similarity (Weight: 25)
    // Title similarity
    const titleSim = calculateTextSimilarity(lostItem.title, foundItem.title);
    // Description similarity
    const descSim = calculateTextSimilarity(lostItem.description, foundItem.description);
    const combinedTextSim = Math.max(titleSim * 0.7 + descSim * 0.3, titleSim);

    if (combinedTextSim > 0.5) {
      score += 25;
      reasons.push('Strong title & description match');
    } else if (combinedTextSim > 0.25) {
      score += 15;
      reasons.push('Partial title match');
    } else if (
      normalize(lostItem.title).includes(normalize(foundItem.title)) ||
      normalize(foundItem.title).includes(normalize(lostItem.title))
    ) {
      score += 15;
      reasons.push('Title keyword match');
    }

    return {
      score: Math.min(Math.round(score), 100),
      reasons,
    };
  }

  async findMatchesForUser(userId: string): Promise<MatchCandidate[]> {
    const lostItems = await Item.find({ reporter: userId as any, type: 'LOST' });
    if (lostItems.length === 0) return [];

    const foundItems = await Item.find({
      type: 'FOUND',
      status: { $in: ['REPORTED', 'MATCH_FOUND'] },
    }).populate('reporter', 'name email');

    const matches: MatchCandidate[] = [];

    for (const found of foundItems) {
      let bestMatch: { lost: IItem; score: number; reasons: string[] } | null = null;

      for (const lost of lostItems) {
        const { score, reasons } = this.calculateScore(lost, found);
        if (score >= 35 && (!bestMatch || score > bestMatch.score)) {
          bestMatch = { lost, score, reasons };
        }
      }

      if (bestMatch) {
        matches.push({
          foundItem: found,
          lostItem: bestMatch.lost,
          score: bestMatch.score,
          reasons: bestMatch.reasons,
        });
      }
    }

    return matches.sort((a, b) => b.score - a.score);
  }

  async findMatchesForItem(itemId: string): Promise<MatchCandidate[]> {
    const targetItem = await Item.findById(itemId);
    if (!targetItem) return [];

    const isTargetLost = targetItem.type === 'LOST';
    const queryType = isTargetLost ? 'FOUND' : 'LOST';

    const potentialMatches = await Item.find({
      type: queryType,
      status: { $in: ['REPORTED', 'MATCH_FOUND'] },
    }).populate('reporter', 'name email');

    const results: MatchCandidate[] = [];

    for (const other of potentialMatches) {
      const lost = isTargetLost ? targetItem : other;
      const found = isTargetLost ? other : targetItem;

      const { score, reasons } = this.calculateScore(lost, found);
      if (score >= 30) {
        results.push({
          lostItem: lost,
          foundItem: found,
          score,
          reasons,
        });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }
}

export const matchingEngine = new DeterministicMatchingEngine();
