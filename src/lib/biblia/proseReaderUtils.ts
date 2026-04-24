import type { ContentSection } from "$lib/components/AticleAssets";

export type EmphasisTextSegment = {
	text: string;
	emphasized: boolean;
};

const escapeRegExp = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Split legacy editor / API `sectionBody` into display paragraphs. */
export const splitLegacySectionBodyToParagraphs = (body: string): string[] => {
	const normalized = body.trim();
	if (!normalized) {
		return [];
	}
	const blocks = normalized
		.split(/\n\s*\n/)
		.map((block) => block.trim())
		.filter(Boolean);
	if (blocks.length > 0) {
		return blocks;
	}
	return normalized
		.split(/\n/)
		.map((line) => line.trim())
		.filter(Boolean);
};

type SectionLike = Pick<ContentSection, "type" | "content" | "sectionBody">;

/**
 * Paragraphs to show for a prose section: prefer `content`, else legacy `sectionBody`.
 */
export const getProseParagraphsFromSection = (section: SectionLike): string[] => {
	if (section.type !== "prose") {
		return [];
	}
	const raw = section.content;
	if (Array.isArray(raw) && raw.some((p) => String(p ?? "").trim().length > 0)) {
		return raw.map((p) => String(p).trim()).filter((p) => p.length > 0);
	}
	const body = section.sectionBody;
	if (typeof body === "string" && body.trim()) {
		return splitLegacySectionBodyToParagraphs(body);
	}
	return [];
};

const splitMarkdownBold = (text: string): EmphasisTextSegment[] => {
	if (!text) {
		return [];
	}
	const re = /\*\*((?:[^*]|\*(?!\*))+?)\*\*/g;
	const parts: EmphasisTextSegment[] = [];
	let last = 0;
	let match: RegExpExecArray | null;
	while ((match = re.exec(text)) !== null) {
		if (match.index > last) {
			parts.push({ text: text.slice(last, match.index), emphasized: false });
		}
		if (match[1].trim().length > 0) {
			parts.push({ text: match[1], emphasized: true });
		}
		last = re.lastIndex;
	}
	if (last < text.length) {
		parts.push({ text: text.slice(last), emphasized: false });
	}
	return parts.length > 0 ? parts : [{ text, emphasized: false }];
};

/**
 * Split a paragraph into plain / emphasized runs using phrase list and inline `**bold**`.
 * Phrases are matched literally (longest first). Safe when a phrase is missing from text.
 */
export const buildEmphasisParts = (paragraph: string, phrases: string[] | undefined): EmphasisTextSegment[] => {
	const cleaned = (phrases ?? []).map((p) => p.trim()).filter((p) => p.length > 0);
	const uniqueSorted = [...new Set(cleaned)].sort((a, b) => b.length - a.length);

	if (uniqueSorted.length === 0) {
		return splitMarkdownBold(paragraph);
	}

	const pattern = uniqueSorted.map(escapeRegExp).join("|");
	const splitter = new RegExp(`(${pattern})`, "g");
	const chunks = paragraph.split(splitter).filter((c) => c.length > 0);
	const out: EmphasisTextSegment[] = [];

	for (const chunk of chunks) {
		if (uniqueSorted.includes(chunk)) {
			out.push({ text: chunk, emphasized: true });
		} else {
			out.push(...splitMarkdownBold(chunk));
		}
	}

	return out.length > 0 ? out : [{ text: paragraph, emphasized: false }];
};
