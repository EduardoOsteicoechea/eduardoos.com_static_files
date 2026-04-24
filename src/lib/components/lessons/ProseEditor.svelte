<script lang="ts">
	let {
		id,
		label = "Cuerpo de la sección",
		value,
		onValueChange
	}: {
		id: string;
		label?: string;
		value: string;
		onValueChange: (next: string) => void;
	} = $props();

	let textareaEl = $state<HTMLTextAreaElement | null>(null);

	const applyValue = (next: string, focusStart: number, focusEnd: number): void => {
		onValueChange(next);
		queueMicrotask(() => {
			const el = textareaEl;
			if (!el) {
				return;
			}
			el.focus();
			el.setSelectionRange(focusStart, focusEnd);
		});
	};

	const insertParagraph = (): void => {
		const el = textareaEl;
		if (!el) {
			return;
		}
		const start = el.selectionStart;
		const end = el.selectionEnd;
		const insertion = "\n\n";
		const next = value.slice(0, end) + insertion + value.slice(end);
		const caret = end + insertion.length;
		applyValue(next, caret, caret);
	};

	const wrapSelection = (before: string, after: string, emptyFallback = ""): void => {
		const el = textareaEl;
		if (!el) {
			return;
		}
		const start = el.selectionStart;
		const end = el.selectionEnd;
		const selected = value.slice(start, end) || emptyFallback;
		const next = value.slice(0, start) + before + selected + after + value.slice(end);
		const caret = start + before.length + selected.length + after.length;
		applyValue(next, caret, caret);
	};

	const addEmphasis = (): void => {
		wrapSelection("**", "**", "énfasis");
	};

	const addBiblicalQuote = (): void => {
		const el = textareaEl;
		if (!el) {
			return;
		}
		const start = el.selectionStart;
		const end = el.selectionEnd;
		if (start === end) {
			window.alert("Selecciona el texto de la cita antes de pulsar «Cita bíblica».");
			return;
		}
		const ref = window.prompt("Referencia bíblica (ej. Gálatas 1:15-16)", "");
		if (ref === null || !ref.trim()) {
			return;
		}
		const safeRef = ref.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
		wrapSelection(`[quote ref="${safeRef}"]`, "[/quote]", "");
	};
</script>

<div class="prose-editor">
	<span class="prose-editor-label" id="{id}-label">{label}</span>
	<div class="prose-toolbar" role="toolbar" aria-label="Formato de prosa">
		<button type="button" class="tb-btn" onclick={insertParagraph}>Párrafo</button>
		<button type="button" class="tb-btn" onclick={addBiblicalQuote}>Cita bíblica</button>
		<button type="button" class="tb-btn" onclick={addEmphasis}>Énfasis</button>
	</div>
	<p class="prose-hint">
		Párrafo: línea en blanco. Cita: envuelve el texto seleccionado. Énfasis: <code>**texto**</code>.
	</p>
	<textarea
		bind:this={textareaEl}
		{id}
		class="prose-ta"
		aria-labelledby="{id}-label"
		{value}
		oninput={(event) => onValueChange((event.currentTarget as HTMLTextAreaElement).value)}
		placeholder="Escribe aquí. Usa dos saltos de línea entre párrafos."
		required
	></textarea>
</div>

<style>
	.prose-editor {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		width: 100%;
		max-width: 100%;
	}

	.prose-editor-label {
		font-size: var(--font-size-4);
		font-weight: 600;
		color: var(--text-main);
	}

	.prose-toolbar {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		align-items: center;
	}

	.tb-btn {
		font-size: var(--font-size-3);
		padding: 0.2rem 0.45rem;
		border: 1px solid var(--border-clear);
		border-radius: var(--radius-1);
		background: var(--btn-secondary-bg);
		color: var(--text-main);
		cursor: pointer;
	}

	.tb-btn:hover {
		background: var(--btn-hover-bg);
	}

	.prose-hint {
		margin: 0;
		font-size: var(--font-size-3);
		line-height: var(--line-height-3);
		color: var(--text-muted);
	}

	.prose-hint code {
		font-size: 0.95em;
	}

	.prose-ta {
		width: 100%;
		max-width: 100%;
		box-sizing: border-box;
		min-height: 8rem;
		resize: vertical;
		margin: 0;
	}
</style>
