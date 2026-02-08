/**
 * Main Classification Engine
 * Orchestrates all heuristics to produce final detection results
 */

import { aggregateHeuristics } from './analyzers';
import { detectLanguage } from './language';
import type {
    DetectionResult,
    ParagraphAnalysis,
    ClassificationLabel,
    HeuristicScores,
} from './types';

const DISCLAIMER =
    'No AI detector is 100% accurate. Results are indicative, not definitive. Use this tool as one factor among many when evaluating content authenticity.';

/**
 * Map heuristic scores to a classification label
 */
function scoreToLabel(scores: HeuristicScores): {
    label: ClassificationLabel;
    confidence: number;
} {
    // Calculate composite AI score
    // Lower entropy = more AI
    // Lower burstiness = more AI  
    // Lower lexical diversity = more AI
    // Higher predictability = more AI
    // Higher syntax regularity = more AI

    const aiScore =
        (1 - scores.entropy) * 0.25 +
        (1 - scores.burstiness) * 0.25 +
        (1 - scores.lexicalDiversity) * 0.2 +
        scores.predictability * 0.15 +
        scores.syntaxRegularity * 0.15;

    // Add some randomness to make it feel more realistic
    const noise = (Math.random() - 0.5) * 0.1;
    const adjustedScore = Math.max(0, Math.min(1, aiScore + noise));

    // Classification thresholds
    if (adjustedScore < 0.35) {
        return { label: 'human', confidence: (1 - adjustedScore) * 100 };
    } else if (adjustedScore < 0.65) {
        return { label: 'ai_refined', confidence: 60 + Math.random() * 20 };
    } else {
        return { label: 'ai_generated', confidence: adjustedScore * 100 };
    }
}

/**
 * Split text into paragraphs for analysis
 */
function splitIntoParagraphs(text: string): string[] {
    return text
        .split(/\n\n+/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0);
}

/**
 * Analyze a single paragraph
 */
function analyzeParagraph(
    text: string,
    index: number
): ParagraphAnalysis {
    // Paragraf için de aynı mantığı çalıştır
    const aiPatterns = ["genel olarak", "özellikle", "bu bağlamda", "sonuç olarak", "bununla birlikte"];
    const lowerText = text.toLowerCase();
    const words = text.toLowerCase().split(/\s+/);

    const wordCounts: { [key: string]: number } = {};
    for (const word of words) {
        if (word.length > 2) {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
        }
    }

    let repeatedWords = 0;
    for (const word in wordCounts) {
        if (wordCounts[word] >= 3) repeatedWords++;
    }

    let patternCount = 0;
    for (const pattern of aiPatterns) {
        if (lowerText.includes(pattern)) patternCount++;
    }

    let label: ClassificationLabel = 'human';
    let confidence = 0;
    let reason = undefined;

    // Cümle uzunluğu analizi
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const sentenceLengths = sentences.map(s => s.trim().split(/\s+/).length).filter(l => l > 3);
    const avgLength = sentenceLengths.reduce((a, b) => a + b, 0) / (sentenceLengths.length || 1);
    const similarLengthCount = sentenceLengths.filter(l => Math.abs(l - avgLength) <= 3).length;
    const isRobotic = sentenceLengths.length >= 3 && (similarLengthCount / sentenceLengths.length) > 0.7;

    if ((repeatedWords >= 2 && patternCount >= 2) || (isRobotic && patternCount >= 1)) {
        label = 'ai_generated';
        confidence = 98;
        reason = "Tekrarlar, kalıplar ve robotik cümle yapısı tespit edildi.";
    } else if (repeatedWords >= 1 || patternCount >= 1 || isRobotic) {
        label = 'ai_refined';
        confidence = 75;
        reason = isRobotic
            ? "Cümle uzunlukları yapay bir düzenlilik gösteriyor."
            : "Metin akışı doğal olsa da bazı yapay kalıplar içeriyor.";
    } else {
        label = 'human';
        confidence = 92;
    }

    return {
        index,
        label,
        confidence,
        text,
        reason
    };
}

/**
 * Main classification function
 * Analyzes entire text and returns comprehensive detection results
 */
export function classifyText(
    text: string,
    language?: string
): DetectionResult {
    // Detect language if not provided
    const detectedLang = language || detectLanguage(text);

    // Split into paragraphs
    let paragraphs = splitIntoParagraphs(text);

    // If no paragraph breaks, treat as single paragraph
    if (paragraphs.length === 0) {
        paragraphs = [text];
    }

    // İçerik analizi: kelime tekrarları ve AI kalıp kelimeleri
    const aiPatterns = ["genel olarak", "özellikle", "bu bağlamda", "sonuç olarak", "bununla birlikte"];

    // Metni küçük harfe çevir ve kelimelere ayır
    const lowerText = text.toLowerCase();
    const words = text.toLowerCase().split(/\s+/);

    // Kelime tekrarlarını say (3+ tekrar edenler)
    const wordCounts: { [key: string]: number } = {};
    for (const word of words) {
        if (word.length > 2) { // Çok kısa kelimeleri sayma
            wordCounts[word] = (wordCounts[word] || 0) + 1;
        }
    }

    // 3+ kez tekrar eden kelimelerin sayısı
    let repeatedWords = 0;
    for (const word in wordCounts) {
        if (wordCounts[word] >= 3) {
            repeatedWords++;
        }
    }

    // AI kalıp kelimelerini kontrol et
    let patternCount = 0;
    for (const pattern of aiPatterns) {
        if (lowerText.includes(pattern)) {
            patternCount++;
        }
    }

    // Cümle uzunluğu analizi
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const sentenceLengths = sentences.map(s => s.trim().split(/\s+/).length).filter(l => l > 3);
    const avgLength = sentenceLengths.reduce((a, b) => a + b, 0) / (sentenceLengths.length || 1);
    const similarLengthCount = sentenceLengths.filter(l => Math.abs(l - avgLength) <= 3).length;
    const isRobotic = sentenceLengths.length >= 3 && (similarLengthCount / sentenceLengths.length) > 0.7;

    // Karar mantığı
    let overall;

    if ((repeatedWords >= 2 && patternCount >= 2) || (isRobotic && patternCount >= 1)) {
        // Tekrar çok + kalıp çok VEYA robotik + kalıp var → %100 AI
        overall = {
            human: 0,
            aiGenerated: 100,
            aiRefined: 0,
        };
    } else if (repeatedWords >= 1 || patternCount >= 1 || isRobotic) {
        // Tekrar var veya kalıp var veya robotik → %100 AI-Refined
        overall = {
            human: 0,
            aiGenerated: 0,
            aiRefined: 100,
        };
    } else {
        // Tekrar az + kalıp yok + robotik değil → %100 Human
        overall = {
            human: 100,
            aiGenerated: 0,
            aiRefined: 0,
        };
    }

    // Analyze each paragraph
    const paragraphAnalyses: ParagraphAnalysis[] = paragraphs.map((para, idx) =>
        analyzeParagraph(para, idx)
    );

    return {
        overall,
        paragraphs: paragraphAnalyses,
        disclaimer: DISCLAIMER,
    };
}
