export type ClassificationLabel = 'human' | 'ai_generated';

export interface ParagraphAnalysis {
    index: number;
    label: ClassificationLabel;
    confidence: number;
    text: string;
    reason?: string;
}

export interface OverallScore {
    human: number;
    aiGenerated: number;
}

export interface DetectionResult {
    overall: OverallScore;
    paragraphs: ParagraphAnalysis[];
    disclaimer: string;
    detectedLanguage?: string;
}

export interface HeuristicScores {
    entropy: number;
    burstiness: number;
    lexicalDiversity: number;
    predictability: number;
    syntaxRegularity: number;
}
