// ---------------------------------------------------------------------------
// Content Extractor - Extrae contenido real del summaryText de un tema
// para generar actividades interactivas: flashcards, match-pairs, timeline,
// keywords.
// ---------------------------------------------------------------------------

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);
}

function extractNounPhrases(sentence: string): string[] {
  // Simple heuristic: capitalized words/phrases and words after "es", "son", "tiene"
  const phrases: string[] = [];
  const words = sentence.split(/\s+/);
  let current: string[] = [];
  for (const w of words) {
    if (/^[A-ZÁÉÍÓÚÑ]/.test(w) && current.length < 3) {
      current.push(w);
    } else {
      if (current.length >= 1) phrases.push(current.join(" "));
      current = [];
    }
  }
  if (current.length >= 1) phrases.push(current.join(" "));
  return phrases;
}

// ---------------------------------------------------------------------------
// FLASHCARDS: concept → definition pairs extracted from sentences
// ---------------------------------------------------------------------------
export interface FlashcardPair {
  front: string;
  back: string;
}

export function extractFlashcards(summaryText: string, topicTitle: string): FlashcardPair[] {
  const sentences = splitSentences(summaryText);
  const cards: FlashcardPair[] = [];

  // Card 1: Main topic question
  cards.push({
    front: `¿Qué aprenderás en "${topicTitle}"?`,
    back: sentences[0] || topicTitle,
  });

  // Extract concept-definition pairs from sentences
  for (let i = 1; i < sentences.length && cards.length < 8; i++) {
    const s = sentences[i];
    // Look for definition patterns: "X es Y", "X son Y", "X tiene Y"
    const defMatch = s.match(/^([A-ZÁÉÍÓÚÑ][^.]{5,60}?)\s+(es|son|tiene|tienen|fue|fueron|se|está|están)\s+(.+)$/i);
    if (defMatch) {
      const concept = defMatch[1].trim();
      const definition = s;
      cards.push({ front: `¿Qué es "${concept}"?`, back: definition });
    } else if (s.length > 20 && s.length < 200) {
      // Use sentence as concept card
      const words = s.split(/\s+/).slice(0, 4).join(" ");
      cards.push({ front: `Concepto clave: "${words}..."`, back: s });
    }
  }

  // Ensure minimum 3 cards
  while (cards.length < 3) {
    cards.push({
      front: `¿Listo para el reto sobre ${topicTitle}?`,
      back: "Demuestra lo que has aprendido en el cuestionario",
    });
  }

  return cards;
}

// ---------------------------------------------------------------------------
// MATCH PAIRS: term ↔ definition pairs
// ---------------------------------------------------------------------------
export interface MatchPair {
  id: string;
  term: string;
  definition: string;
}

export function extractMatchPairs(summaryText: string, topicTitle: string): MatchPair[] {
  const sentences = splitSentences(summaryText);
  const pairs: MatchPair[] = [];

  for (let i = 0; i < sentences.length && pairs.length < 6; i++) {
    const s = sentences[i];
    // Pattern: "X es Y" or "X son Y"
    const match = s.match(/^([A-ZÁÉÍÓÚÑ][^.]{3,40}?)\s+(es|son|tiene|tienen|fue|fueron|representa|representan|significa|significan|consiste|consisten|se define|se definen)\s+(.+)$/i);
    if (match) {
      const term = match[1].trim();
      let definition = match[3].trim();
      // Clean up definition
      if (definition.length > 80) definition = definition.slice(0, 77) + "...";
      pairs.push({ id: `p${pairs.length}`, term, definition });
    }
  }

  // Fallback: use key sentences as pairs
  if (pairs.length < 3) {
    for (let i = 0; i < sentences.length && pairs.length < 4; i++) {
      const s = sentences[i];
      const words = s.split(/\s+/);
      if (words.length >= 5 && !pairs.some((p) => p.definition === s)) {
        pairs.push({
          id: `p${pairs.length}`,
          term: words.slice(0, 3).join(" "),
          definition: s.length > 80 ? s.slice(0, 77) + "..." : s,
        });
      }
    }
  }

  return pairs;
}

// ---------------------------------------------------------------------------
// TIMELINE: sequential events/steps extracted from text
// ---------------------------------------------------------------------------
export interface TimelineEvent {
  id: string;
  label: string;
  order: number;
}

export function extractTimeline(summaryText: string, topicTitle: string): TimelineEvent[] {
  const sentences = splitSentences(summaryText);
  const events: TimelineEvent[] = [];

  // Look for sequential/temporal patterns
  const temporalWords = ["primero", "luego", "después", "finalmente", "antes", "entonces", "posteriormente", "seguidamente", "inicialmente"];
  const yearPattern = /\b(1[5-9]\d{2}|20[0-2]\d)\b/;

  for (let i = 0; i < sentences.length && events.length < 6; i++) {
    const s = sentences[i];
    const hasTemporal = temporalWords.some((w) => s.toLowerCase().includes(w));
    const hasYear = yearPattern.test(s);
    const isLongEnough = s.length > 25;

    if ((hasTemporal || hasYear || isLongEnough) && events.length < 6) {
      // Extract a short label from the sentence
      const words = s.split(/\s+/);
      const label = words.slice(0, 5).join(" ");
      events.push({
        id: `t${events.length}`,
        label: label.length > 50 ? label.slice(0, 47) + "..." : label,
        order: events.length,
      });
    }
  }

  // If not enough temporal events, create from main sentences
  if (events.length < 3) {
    const used = new Set(events.map((e) => e.label));
    for (const s of sentences) {
      if (events.length >= 5) break;
      const words = s.split(/\s+/);
      const label = words.slice(0, 5).join(" ");
      if (!used.has(label) && s.length > 20) {
        events.push({
          id: `t${events.length}`,
          label: label.length > 50 ? label.slice(0, 47) + "..." : label,
          order: events.length,
        });
        used.add(label);
      }
    }
  }

  return events;
}

// ---------------------------------------------------------------------------
// KEYWORDS: important words with weight/frequency
// ---------------------------------------------------------------------------
export interface KeywordItem {
  word: string;
  weight: number; // 1-10, higher = more important
  definition?: string;
}

export function extractKeywords(summaryText: string, topicTitle: string): KeywordItem[] {
  const stopWords = new Set([
    "el", "la", "los", "las", "de", "del", "en", "y", "a", "es", "son", "se",
    "que", "por", "con", "para", "su", "sus", "al", "como", "más", "muy",
    "un", "una", "unos", "unas", "este", "esta", "estos", "estas", "pero",
    "si", "no", "también", "cada", "todo", "toda", "todos", "todas",
    "desde", "hasta", "entre", "sobre", "tras", "durante", "según", "sin",
    "the", "is", "are", "was", "were", "has", "have", "had", "been",
  ]);

  const words = summaryText
    .toLowerCase()
    .replace(/[.,;:!?()""«»—–\-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stopWords.has(w));

  // Count frequency
  const freq: Record<string, number> = {};
  for (const w of words) {
    freq[w] = (freq[w] || 0) + 1;
  }

  // Sort by frequency, take top keywords
  const sorted = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const maxFreq = sorted[0]?.[1] || 1;

  const keywords: KeywordItem[] = sorted.map(([word, count]) => ({
    word,
    weight: Math.min(10, Math.max(2, Math.round((count / maxFreq) * 10))),
    definition: findDefinition(word, summaryText),
  }));

  // Add title words as high-weight keywords
  const titleWords = topicTitle
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stopWords.has(w));
  for (const tw of titleWords) {
    if (!keywords.some((k) => k.word === tw)) {
      keywords.push({ word: tw, weight: 8, definition: findDefinition(tw, summaryText) });
    }
  }

  return keywords.slice(0, 12);
}

function findDefinition(word: string, text: string): string | undefined {
  const sentences = splitSentences(text);
  for (const s of sentences) {
    if (s.toLowerCase().includes(word.toLowerCase())) {
      const defMatch = s.match(/^([A-ZÁÉÍÓÚÑ][^.]{5,60}?)\s+(es|son|tiene|tienen|fue|fueron|se|está|están|representa|representan|significa|significan)\s+(.+)$/i);
      if (defMatch) return s;
    }
  }
  return undefined;
}
