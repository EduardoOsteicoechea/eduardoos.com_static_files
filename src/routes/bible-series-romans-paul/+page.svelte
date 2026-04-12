<script lang="ts">
	import { slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	/** Which section panels are expanded (independent toggles). */
	let open = $state<Record<string, boolean>>({});

	const slideOpts = { duration: 320, easing: cubicOut, axis: 'y' as const };

	/** Document order; the sticky header applies to the last open section (lowest on the page). */
	const SECTION_ORDER = [
		'pasaje',
		'idea',
		'textos',
		'aplicacion',
		'legitiman',
		'creencias',
		'aclaraciones',
		'beneficios',
		'impactos',
	] as const;

	const stickySectionId = $derived.by(() => {
		let last: (typeof SECTION_ORDER)[number] | null = null;
		for (const id of SECTION_ORDER) {
			if (open[id]) last = id;
		}
		return last;
	});

	function isStickyTrigger(id: string) {
		return !!open[id] && stickySectionId === id;
	}

	function titleCaseBook(name: string) {
		return name
			.split(/\s+/)
			.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
			.join(' ');
	}

	function formatReference(
		libro: string,
		capitulos: number[],
		versiculos: number[]
	): string {
		const cap = capitulos.join(', ');
		const ver = versiculos.join(', ');
		return `${titleCaseBook(libro)} ${cap}:${ver}`;
	}

	function toggleSection(id: string) {
		open[id] = !open[id];
	}

	function isOpen(id: string) {
		return !!open[id];
	}

	const headerReference = $derived(
		formatReference(
			data.lesson.libro_de_pasaje,
			data.lesson.capitulos_de_pasaje,
			data.lesson.versiculos_de_pasaje
		)
	);
</script>

<svelte:head>
	<title>{data.lesson.texto_nbla} — Romanos</title>
</svelte:head>

<div class="page-shell">
	<div class="page-glass" aria-hidden="true"></div>
	<main class="page">
	<header class="page-header">
		<p class="eyebrow">Serie bíblica · Romanos</p>
		<h1 class="title">{data.lesson.texto_nbla}</h1>
		<p class="subtitle">{headerReference}</p>
	</header>

	<div class="accordion" role="presentation">
			<!-- Pasaje base -->
			<section class="accordion-block">
				<button
					type="button"
					class="accordion-trigger"
					class:accordion-trigger--open={isOpen('pasaje')}
					class:accordion-trigger--sticky={isStickyTrigger('pasaje')}
					aria-expanded={isOpen('pasaje')}
					aria-controls="panel-pasaje"
					id="trigger-pasaje"
					onclick={() => toggleSection('pasaje')}
				>
					<span class="accordion-label">Pasaje base</span>
					<span class="chevron" aria-hidden="true"></span>
				</button>
				{#if isOpen('pasaje')}
					<div
						id="panel-pasaje"
						class="accordion-panel"
						role="region"
						aria-labelledby="trigger-pasaje"
						transition:slide={slideOpts}
					>
						<div class="panel-inner prose">
							<p class="ref-line">{headerReference}</p>
							{#if data.lesson.texto_nestleadam}
								<p class="greek">{data.lesson.texto_nestleadam}</p>
							{/if}
							{#if data.lesson.texto_rvr60}
								<p>{data.lesson.texto_rvr60}</p>
							{/if}
							<p class="lead">{data.lesson.texto_nbla}</p>
							<p class="meta">Facilitador: {data.lesson.facilitador}</p>
						</div>
					</div>
				{/if}
			</section>

			<!-- Idea principal -->
			<section class="accordion-block">
				<button
					type="button"
					class="accordion-trigger"
					class:accordion-trigger--open={isOpen('idea')}
					class:accordion-trigger--sticky={isStickyTrigger('idea')}
					aria-expanded={isOpen('idea')}
					aria-controls="panel-idea"
					id="trigger-idea"
					onclick={() => toggleSection('idea')}
				>
					<span class="accordion-label">Idea principal</span>
					<span class="chevron" aria-hidden="true"></span>
				</button>
				{#if isOpen('idea')}
					<div
						id="panel-idea"
						class="accordion-panel"
						role="region"
						aria-labelledby="trigger-idea"
						transition:slide={slideOpts}
					>
						<div class="panel-inner prose">
							{#each data.lesson.idea.núcleo as paragraph, i (i)}
								<p>{paragraph}</p>
							{/each}
						</div>
					</div>
				{/if}
			</section>

			<!-- Textos bíblicos clave -->
			<section class="accordion-block">
				<button
					type="button"
					class="accordion-trigger"
					class:accordion-trigger--open={isOpen('textos')}
					class:accordion-trigger--sticky={isStickyTrigger('textos')}
					aria-expanded={isOpen('textos')}
					aria-controls="panel-textos"
					id="trigger-textos"
					onclick={() => toggleSection('textos')}
				>
					<span class="accordion-label">Textos bíblicos clave</span>
					<span class="chevron" aria-hidden="true"></span>
				</button>
				{#if isOpen('textos')}
					<div
						id="panel-textos"
						class="accordion-panel"
						role="region"
						aria-labelledby="trigger-textos"
						transition:slide={slideOpts}
					>
						<div class="panel-inner prose">
							{#each data.lesson.idea.textos_biblicos_clave as t, i (i)}
								<article class="biblio-card">
									<h3 class="biblio-ref">
										{formatReference(t.libro_de_pasaje, t.capitulos_de_pasaje, t.versiculos_de_pasaje)}
									</h3>
									<blockquote class="biblio-quote">{t.texto_nbla}</blockquote>
									<p class="biblio-aporte"><span class="biblio-aporte-label">Aporte:</span> {t.aporte}</p>
								</article>
							{/each}
						</div>
					</div>
				{/if}
			</section>

			<!-- Aplicación -->
			<section class="accordion-block">
				<button
					type="button"
					class="accordion-trigger"
					class:accordion-trigger--open={isOpen('aplicacion')}
					class:accordion-trigger--sticky={isStickyTrigger('aplicacion')}
					aria-expanded={isOpen('aplicacion')}
					aria-controls="panel-aplicacion"
					id="trigger-aplicacion"
					onclick={() => toggleSection('aplicacion')}
				>
					<span class="accordion-label">Aplicación</span>
					<span class="chevron" aria-hidden="true"></span>
				</button>
				{#if isOpen('aplicacion')}
					<div
						id="panel-aplicacion"
						class="accordion-panel"
						role="region"
						aria-labelledby="trigger-aplicacion"
						transition:slide={slideOpts}
					>
						<div class="panel-inner prose">
							<p>{data.lesson.idea.aplicacion}</p>
						</div>
					</div>
				{/if}
			</section>

			<!-- Textos que legitiman la aplicación -->
			<section class="accordion-block">
				<button
					type="button"
					class="accordion-trigger"
					class:accordion-trigger--open={isOpen('legitiman')}
					class:accordion-trigger--sticky={isStickyTrigger('legitiman')}
					aria-expanded={isOpen('legitiman')}
					aria-controls="panel-legitiman"
					id="trigger-legitiman"
					onclick={() => toggleSection('legitiman')}
				>
					<span class="accordion-label">Textos que legitiman la aplicación</span>
					<span class="chevron" aria-hidden="true"></span>
				</button>
				{#if isOpen('legitiman')}
					<div
						id="panel-legitiman"
						class="accordion-panel"
						role="region"
						aria-labelledby="trigger-legitiman"
						transition:slide={slideOpts}
					>
						<div class="panel-inner prose">
							{#each data.lesson.idea.textos_biblicos_que_legitiman_aplicacion as t, i (i)}
								<article class="biblio-card">
									<h3 class="biblio-ref">
										{formatReference(t.libro_de_pasaje, t.capitulos_de_pasaje, t.versiculos_de_pasaje)}
									</h3>
									<blockquote class="biblio-quote">{t.texto_nbla}</blockquote>
									<p class="biblio-aporte"><span class="biblio-aporte-label">Aporte:</span> {t.aporte}</p>
								</article>
							{/each}
						</div>
					</div>
				{/if}
			</section>

			<!-- Creencias fundamentales -->
			<section class="accordion-block">
				<button
					type="button"
					class="accordion-trigger"
					class:accordion-trigger--open={isOpen('creencias')}
					class:accordion-trigger--sticky={isStickyTrigger('creencias')}
					aria-expanded={isOpen('creencias')}
					aria-controls="panel-creencias"
					id="trigger-creencias"
					onclick={() => toggleSection('creencias')}
				>
					<span class="accordion-label">Creencias fundamentales de aplicación</span>
					<span class="chevron" aria-hidden="true"></span>
				</button>
				{#if isOpen('creencias')}
					<div
						id="panel-creencias"
						class="accordion-panel"
						role="region"
						aria-labelledby="trigger-creencias"
						transition:slide={slideOpts}
					>
						<div class="panel-inner prose">
							<ul class="bullet-list">
								{#each data.lesson.idea.creencias_fundamentales_de_aplicacion as item, i (i)}
									<li>{item}</li>
								{/each}
							</ul>
						</div>
					</div>
				{/if}
			</section>

			<!-- Aclaraciones -->
			<section class="accordion-block">
				<button
					type="button"
					class="accordion-trigger"
					class:accordion-trigger--open={isOpen('aclaraciones')}
					class:accordion-trigger--sticky={isStickyTrigger('aclaraciones')}
					aria-expanded={isOpen('aclaraciones')}
					aria-controls="panel-aclaraciones"
					id="trigger-aclaraciones"
					onclick={() => toggleSection('aclaraciones')}
				>
					<span class="accordion-label">Aclaraciones</span>
					<span class="chevron" aria-hidden="true"></span>
				</button>
				{#if isOpen('aclaraciones')}
					<div
						id="panel-aclaraciones"
						class="accordion-panel"
						role="region"
						aria-labelledby="trigger-aclaraciones"
						transition:slide={slideOpts}
					>
						<div class="panel-inner prose">
							<ul class="bullet-list">
								{#each data.lesson.idea.aclaraciones as item, i (i)}
									<li>{item}</li>
								{/each}
							</ul>
						</div>
					</div>
				{/if}
			</section>

			<!-- Beneficios de aplicación -->
			<section class="accordion-block">
				<button
					type="button"
					class="accordion-trigger"
					class:accordion-trigger--open={isOpen('beneficios')}
					class:accordion-trigger--sticky={isStickyTrigger('beneficios')}
					aria-expanded={isOpen('beneficios')}
					aria-controls="panel-beneficios"
					id="trigger-beneficios"
					onclick={() => toggleSection('beneficios')}
				>
					<span class="accordion-label">Beneficios de aplicación</span>
					<span class="chevron" aria-hidden="true"></span>
				</button>
				{#if isOpen('beneficios')}
					<div
						id="panel-beneficios"
						class="accordion-panel"
						role="region"
						aria-labelledby="trigger-beneficios"
						transition:slide={slideOpts}
					>
						<div class="panel-inner prose">
							<ul class="bullet-list">
								{#each data.lesson.idea.beneficios_de_aplicacion as item, i (i)}
									<li>{item}</li>
								{/each}
							</ul>
						</div>
					</div>
				{/if}
			</section>

			<!-- Impactos en texto base -->
			<section class="accordion-block">
				<button
					type="button"
					class="accordion-trigger"
					class:accordion-trigger--open={isOpen('impactos')}
					class:accordion-trigger--sticky={isStickyTrigger('impactos')}
					aria-expanded={isOpen('impactos')}
					aria-controls="panel-impactos"
					id="trigger-impactos"
					onclick={() => toggleSection('impactos')}
				>
					<span class="accordion-label">Impactos en el texto base</span>
					<span class="chevron" aria-hidden="true"></span>
				</button>
				{#if isOpen('impactos')}
					<div
						id="panel-impactos"
						class="accordion-panel"
						role="region"
						aria-labelledby="trigger-impactos"
						transition:slide={slideOpts}
					>
						<div class="panel-inner prose">
							<ul class="bullet-list">
								{#each data.lesson.impactos_en_texto_base as item, i (i)}
									<li>{item}</li>
								{/each}
							</ul>
						</div>
					</div>
				{/if}
			</section>
		</div>
	</main>
</div>

<style>
	.page-shell {
		position: relative;
		min-height: 100dvh;
	}

	.page-glass {
		position: fixed;
		inset: 0;
		z-index: 0;
		pointer-events: none;
      background: rgba(255,255,255,.95);
	}

	.page {
		position: relative;
		z-index: 1;
		min-height: 100%;
		max-width: 42rem;
		margin: 0 auto;
		padding: 10px 0;
	}

	.page-header {
		margin-bottom: 15px;
		padding: 0 10px;
	}

	.eyebrow {
		margin: 0 0 0.5rem;
	}

	.title {
		margin: 0;
	}

	.subtitle {
		margin: 0.5rem 0 0;
	}

	.accordion {
		display: flex;
		flex-direction: column;
	}

	.accordion-block {
		display: flex;
		flex-direction: column;
		border: 1px solid currentColor;
	}

	.accordion-trigger {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0;
		width: 100%;
		text-align: left;
		padding: 5px 10px;
		border: none;
		cursor: pointer;
	}

	.accordion-trigger:focus-visible {
		outline: 2px solid currentColor;
		outline-offset: 2px;
		z-index: 1;
	}

	.accordion-trigger--sticky {
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.accordion-label {
		flex: 1;
	}

	.chevron {
		flex-shrink: 0;
		width: 0.55rem;
		height: 0.55rem;
		border-right: 2px solid currentColor;
		border-bottom: 2px solid currentColor;
		transform: rotate(45deg);
		transition: transform 0.25s cubic-bezier(0.33, 1, 0.68, 1);
		margin-top: -0.2rem;
	}

	.accordion-trigger--open .chevron {
		transform: rotate(-135deg);
		margin-top: 0.15rem;
	}

	.accordion-panel {
		border-top: 1px solid currentColor;
	}

	.panel-inner {
		padding: 5px;
	}

	.prose {
      display: flex;
      flex-direction: column;
      gap: 15px;
		max-width: 65ch;
      font-size: 14px;
      padding: 10px 10px;
	}

	.prose p:last-child {
		margin-bottom: 0;
	}

	.ref-line {
		margin: 0 0 0rem;
	}

	.greek {
		font-style: italic;
	}

	.meta {
		margin-top: 1.25rem !important;
	}

	.biblio-card {
		padding: 1rem 0;
		border-bottom: 1px solid currentColor;
	}

	.biblio-card:first-child {
		padding-top: 0;
	}

	.biblio-card:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}

	.biblio-ref {
		margin: 0 0 0.65rem;
	}

	.biblio-quote {
		margin: 0 0 0.85rem;
		padding-left: 1rem;
		border-left: 3px solid currentColor;
	}

	.biblio-aporte {
		margin: 0;
	}

	.bullet-list {
		margin: 0;
		padding-left: 1.2rem;
	}

	.bullet-list li {
		margin-bottom: 0.75rem;
		padding-left: 0.25rem;
	}

	.bullet-list li:last-child {
		margin-bottom: 0;
	}
</style>
