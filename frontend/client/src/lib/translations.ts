import type { LanguageCode } from "@shared/schema";

const DELAY = 500;

// Simule une traduction simple en ajoutant un préfixe de langue
export async function simulateTranslation(
  text: string,
  from: LanguageCode,
  to: LanguageCode
): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, DELAY));

  const translations: Record<LanguageCode, (text: string) => string> = {
    fr: (text) => `🇫🇷 ${text} (en français)`,
    en: (text) => `🇬🇧 ${text} (in English)`,
    es: (text) => `🇪🇸 ${text} (en español)`,
    de: (text) => `🇩🇪 ${text} (auf Deutsch)`,
    it: (text) => `🇮🇹 ${text} (in italiano)`,
  };

  return translations[to]?.(text) ?? `[${to.toUpperCase()}] ${text}`;
}