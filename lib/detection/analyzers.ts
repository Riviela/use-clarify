/**
 * Heuristic Analyzers for AI Content Detection
 * Implements multiple analysis techniques to detect AI-generated text patterns
 */

import type { HeuristicScores } from './types';

/**
 * Calculate entropy (randomness) of word choices
 * Lower entropy suggests more predictable, AI-like patterns
 */
export function calculateEntropy(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    if (words.length === 0) return 0;

    const frequency: Record<string, number> = {};
    for (const word of words) {
        frequency[word] = (frequency[word] || 0) + 1;
    }

    let entropy = 0;
    const total = words.length;

    for (const count of Object.values(frequency)) {
        const probability = count / total;
        entropy -= probability * Math.log2(probability);
    }

    // Normalize to 0-1 scale (max entropy is log2(unique words))
    const maxEntropy = Math.log2(Object.keys(frequency).length);
    return maxEntropy > 0 ? entropy / maxEntropy : 0;
}

/**
 * Calculate burstiness (variance in sentence lengths)
 * AI text tends to have more uniform sentence lengths
 */
export function calculateBurstiness(text: string): number {
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    if (sentences.length < 2) return 0.5; // Neutral for single sentence

    const lengths = sentences.map((s) => s.trim().split(/\s+/).length);
    const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;

    const variance =
        lengths.reduce((sum, len) => sum + Math.pow(len - mean, 2), 0) /
        lengths.length;
    const stdDev = Math.sqrt(variance);

    // Coefficient of variation (normalized)
    const cv = mean > 0 ? stdDev / mean : 0;

    // Higher CV (>0.5) suggests human writing (bursty)
    // Lower CV suggests AI (uniform)
    return Math.min(cv, 1);
}

/**
 * Calculate lexical diversity (unique words / total words)
 * AI text often has lower lexical diversity
 */
export function calculateLexicalDiversity(text: string): number {
    const words = text.toLowerCase().split(/\s+/).filter((w) => w.length > 0);
    if (words.length === 0) return 0;

    const uniqueWords = new Set(words);
    return uniqueWords.size / words.length;
}

/**
 * Analyze predictability based on common n-grams
 * AI text tends to use more common phrase patterns
 */
export function calculatePredictability(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    if (words.length < 3) return 0.5;

    // Common AI-generated bigrams and trigrams
    const commonPatterns = [
        'it is',
        'in order',
        'as well',
        'in the',
        'of the',
        'to be',
        'on the',
        'for the',
        'it was',
        'there is',
        'there are',
        'in conclusion',
        'in summary',
        'as a result',
    ];

    let patternCount = 0;
    const text_lower = text.toLowerCase();

    for (const pattern of commonPatterns) {
        const regex = new RegExp(`\\b${pattern}\\b`, 'g');
        const matches = text_lower.match(regex);
        if (matches) {
            patternCount += matches.length;
        }
    }

    // Normalize by text length
    const density = patternCount / (words.length / 10);
    return Math.min(density, 1);
}

/**
 * Analyze syntax regularity
 * AI text tends to have more regular syntactic patterns
 */
export function analyzeSyntaxPatterns(text: string): number {
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    if (sentences.length < 2) return 0.5;

    // Check for repetitive sentence starters
    const starters = sentences.map((s) => {
        const words = s.trim().split(/\s+/);
        return words[0]?.toLowerCase() || '';
    });

    const starterFreq: Record<string, number> = {};
    for (const starter of starters) {
        starterFreq[starter] = (starterFreq[starter] || 0) + 1;
    }

    // Calculate repetition rate
    const maxRepetition = Math.max(...Object.values(starterFreq));
    const repetitionRate = maxRepetition / sentences.length;

    // Higher repetition suggests AI (more regular)
    return repetitionRate;
}

/**
 * Aggregate all heuristics into a comprehensive score
 */
export function aggregateHeuristics(text: string): HeuristicScores {
    return {
        entropy: calculateEntropy(text),
        burstiness: calculateBurstiness(text),
        lexicalDiversity: calculateLexicalDiversity(text),
        predictability: calculatePredictability(text),
        syntaxRegularity: analyzeSyntaxPatterns(text),
    };
}
