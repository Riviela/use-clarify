/**
 * Language Detection Utility
 * Detects language based on character patterns and common words
 */

export type SupportedLanguage = 'en' | 'de' | 'fr' | 'es' | 'unknown';

const languagePatterns = {
    en: ['the', 'and', 'is', 'to', 'in', 'it', 'you', 'that', 'was', 'for'],
    de: ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich'],
    fr: ['le', 'de', 'un', 'être', 'et', 'à', 'il', 'avoir', 'ne', 'je'],
    es: ['el', 'de', 'que', 'y', 'la', 'en', 'un', 'ser', 'se', 'no'],
};

export function detectLanguage(text: string): SupportedLanguage {
    const normalized = text.toLowerCase();
    const words = normalized.split(/\s+/).filter((w) => w.length > 2);

    if (words.length === 0) return 'unknown';

    const scores: Record<string, number> = {
        en: 0,
        de: 0,
        fr: 0,
        es: 0,
    };

    // Count matches for each language
    for (const word of words) {
        for (const [lang, patterns] of Object.entries(languagePatterns)) {
            if (patterns.some((pattern) => word.includes(pattern))) {
                scores[lang]++;
            }
        }
    }

    // Find language with highest score
    const maxScore = Math.max(...Object.values(scores));
    if (maxScore === 0) return 'en'; // Default to English

    const detectedLang = Object.entries(scores).find(
        ([, score]) => score === maxScore
    )?.[0];

    return (detectedLang as SupportedLanguage) || 'en';
}

export function getLanguageName(lang: SupportedLanguage): string {
    const names: Record<SupportedLanguage, string> = {
        en: 'English',
        de: 'German',
        fr: 'French',
        es: 'Spanish',
        unknown: 'Unknown',
    };
    return names[lang];
}
