import type { BiblicalQuote } from "$lib/components/AticleAssets";
import type { LessonBiblicalQuotePayload } from "$lib/types/lessons";

export type CompiledProse = {
	content: string[];
	biblical_quotes: LessonBiblicalQuotePayload[];
	emphasyzed_phrases: string[];
};

const stripEmphasisSegments = (
	raw: string
): {
	plain: string;
	emphasized: string[];
} => {
	const emphasized: string[] = [];
	const plain = raw
		.replace(/\*\*([^*]+)\*\*/g, (_match, inner: string) => {
			const t = String(inner).trim();
			if (t) {
				emphasized.push(t);
			}
			return t;
		})
		.trim();
	return { plain, emphasized };
};

type Segment =
	| { type: "prose"; text: string }
	| { type: "quote"; reference: string; inner: string };

const splitIntoSegments = (source: string): Segment[] => {
	const segments: Segment[] = [];
	const quotePattern = /\[quote\s+ref=["']([^"']*)["']\s*\]([\s\S]*?)\[\/quote\]/gi;
	let lastIndex = 0;
	let match: RegExpExecArray | null;
	while ((match = quotePattern.exec(source)) !== null) {
		if (match.index > lastIndex) {
			segments.push({ type: "prose", text: source.slice(lastIndex, match.index) });
		}
		segments.push({ type: "quote", reference: match[1].trim(), inner: match[2].trim() });
		lastIndex = quotePattern.lastIndex;
	}
	if (lastIndex < source.length) {
		segments.push({ type: "prose", text: source.slice(lastIndex) });
	}
	return segments;
};

const splitProseBlocks = (text: string): string[] => {
	const normalized = text.replace(/\r\n/g, "\n").trim();
	if (!normalized) {
		return [];
	}
	return normalized
		.split(/\n\s*\n+/)
		.map((block) => block.trim())
		.filter(Boolean);
};

/**
 * Compiles editor source (paragraphs, `[quote ref="…"]…[/quote]`, `**emphasis**`)
 * into `content`, `biblical_quotes`, and section-level `emphasyzed_phrases`.
 */
export const compileProseSource = (source: string): CompiledProse => {
	const content: string[] = [];
	const biblical_quotes: LessonBiblicalQuotePayload[] = [];
	const emphasyzed_phrases: string[] = [];

	for (const segment of splitIntoSegments(source)) {
		if (segment.type === "quote") {
			const { plain, emphasized } = stripEmphasisSegments(segment.inner);
			if (!segment.reference || !plain) {
				continue;
			}
			biblical_quotes.push({
				reference: segment.reference,
				text: plain,
				...(emphasized.length > 0 ? { emphasized } : {})
			});
			content.push(plain);
			continue;
		}

		for (const block of splitProseBlocks(segment.text)) {
			const { plain, emphasized } = stripEmphasisSegments(block);
			if (emphasized.length > 0) {
				emphasyzed_phrases.push(...emphasized);
			}
			if (plain) {
				content.push(plain);
			}
		}
	}

	return { content, biblical_quotes, emphasyzed_phrases };
};

/** Fallback when loading legacy rows that only have compiled arrays. */
export const decompileProseToSource = (
	content: string[],
	quotes: BiblicalQuote[] | undefined
): string => {
	const lines: string[] = [];
	const quoteByText = new Map((quotes ?? []).map((q) => [q.text.trim(), q]));

	for (const paragraph of content) {
		const trimmed = paragraph.trim();
		if (!trimmed) {
			continue;
		}
		const quote = quoteByText.get(trimmed);
		if (quote) {
			let inner = quote.text;
			if (quote.emphasized?.length) {
				for (const phrase of quote.emphasized) {
					if (phrase && inner.includes(phrase)) {
						inner = inner.replace(phrase, `**${phrase}**`);
					}
				}
			}
			lines.push(`[quote ref="${quote.reference}"]${inner}[/quote]`);
			quoteByText.delete(trimmed);
		} else {
			lines.push(trimmed);
		}
	}

	return lines.join("\n\n");
};
