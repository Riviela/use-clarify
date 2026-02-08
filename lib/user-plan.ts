export const isPremium = false;

export function getWordLimit(): number {
    return isPremium ? 3000 : 500;
}
