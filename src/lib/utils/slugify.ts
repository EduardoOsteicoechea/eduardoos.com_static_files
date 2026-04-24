/**
 * Turn a human article title into a URL-safe slug (lowercase, hyphens, no accents).
 * Empty or non-alphanumeric result returns "".
 */
export const slugifyArticleName = (rawTitle: string): string => {
	const stripped = rawTitle
		.normalize("NFD")
		.replace(/\p{M}/gu, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
	return stripped;
};
