<script lang="ts">
	import { lessonDashboardStore } from "$lib/stores/lessonDashboardStore";
	import type { LessonRecord } from "$lib/types/lessons";

	const beginLessonEdition = (lessonRecord: LessonRecord): void => {
		lessonDashboardStore.selectLessonForEdition(lessonRecord);
	};

	const deleteLesson = async (lessonId: number): Promise<void> => {
		await lessonDashboardStore.deleteLessonById(lessonId);
	};
</script>

<section class="lesson-list-panel">
	<div class="lesson-list-header">
		<h2>Existing Lessons</h2>
		<button type="button" onclick={() => lessonDashboardStore.selectLessonForCreation()}>New Lesson</button>
	</div>

	{#if $lessonDashboardStore.lessonCollection.length === 0}
		<p>No lessons found.</p>
	{:else}
		<ul class="lesson-list">
			{#each $lessonDashboardStore.lessonCollection as lessonRecord}
				<li class="lesson-list-item">
					<div class="lesson-list-copy">
						<strong>{lessonRecord.titulo_de_ensenanza ?? lessonRecord.tituloDeEnsenanza}</strong>
						<span>
							{lessonRecord.serie}
							{#if lessonRecord.tema_serie ?? lessonRecord.temaSerie}
								· {lessonRecord.tema_serie ?? lessonRecord.temaSerie}
							{/if}
							· {lessonRecord.facilitador}
							{#if lessonRecord.slug}
								· slug: {lessonRecord.slug}
							{/if}
						</span>
					</div>
					<div class="lesson-list-actions">
						<button type="button" onclick={() => beginLessonEdition(lessonRecord)}>Edit</button>
						<button type="button" onclick={() => deleteLesson(lessonRecord.id)}>Delete</button>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</section>

<style>
	.lesson-list-panel {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1rem;
		border: 1px solid var(--border-clear);
		border-radius: var(--radius-1);
		background: var(--accordion-bg);
	}

	.lesson-list-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.lesson-list {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin: 0;
		padding: 0;
	}

	.lesson-list-item {
		border: 1px solid var(--border-clear);
		border-radius: var(--radius-1);
		padding: 0.6rem;
		display: flex;
		justify-content: space-between;
		gap: 0.75rem;
		align-items: center;
	}

	.lesson-list-copy {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.lesson-list-actions {
		display: flex;
		gap: 0.4rem;
	}
</style>
