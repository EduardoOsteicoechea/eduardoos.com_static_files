<script lang="ts">
	import type { LessonQuizOptionEntry, LessonQuizQuestionEntry, LessonUpsertPayload } from "$lib/types/lessons";

	let {
		lessonDraft,
		onLessonDraftChange
	}: {
		lessonDraft: LessonUpsertPayload;
		onLessonDraftChange: (nextLessonDraft: LessonUpsertPayload) => void;
	} = $props();

	const createDefaultQuizOptionEntry = (optionIndex: number): LessonQuizOptionEntry => ({
		optionId: String.fromCharCode(65 + optionIndex),
		optionText: ""
	});

	const createDefaultQuizQuestionEntry = (questionOrder: number): LessonQuizQuestionEntry => ({
		questionOrder,
		questionPrompt: "",
		options: [createDefaultQuizOptionEntry(0), createDefaultQuizOptionEntry(1)],
		correctOptionId: "A",
		rationale: ""
	});

	const commitUpdatedQuizCollection = (nextQuizCollection: LessonQuizQuestionEntry[]): void => {
		onLessonDraftChange({
			...lessonDraft,
			quiz: nextQuizCollection.map((quizQuestionEntry, index) => ({
				...quizQuestionEntry,
				questionOrder: index + 1
			}))
		});
	};

	const updateQuizQuestionField = (
		questionIndex: number,
		fieldName: "questionPrompt" | "correctOptionId" | "rationale",
		fieldValue: string
	): void => {
		const nextQuizCollection = lessonDraft.quiz.map((quizQuestionEntry, currentQuestionIndex) =>
			currentQuestionIndex === questionIndex
				? { ...quizQuestionEntry, [fieldName]: fieldValue }
				: quizQuestionEntry
		);
		commitUpdatedQuizCollection(nextQuizCollection);
	};

	const updateQuizOptionText = (
		questionIndex: number,
		optionIndex: number,
		optionText: string
	): void => {
		const nextQuizCollection = lessonDraft.quiz.map((quizQuestionEntry, currentQuestionIndex) => {
			if (currentQuestionIndex !== questionIndex) return quizQuestionEntry;
			return {
				...quizQuestionEntry,
				options: quizQuestionEntry.options.map((quizOptionEntry, currentOptionIndex) =>
					currentOptionIndex === optionIndex ? { ...quizOptionEntry, optionText } : quizOptionEntry
				)
			};
		});
		commitUpdatedQuizCollection(nextQuizCollection);
	};

	const addQuizQuestion = (): void => {
		commitUpdatedQuizCollection([
			...lessonDraft.quiz,
			createDefaultQuizQuestionEntry(lessonDraft.quiz.length + 1)
		]);
	};

	const removeQuizQuestion = (questionIndex: number): void => {
		if (lessonDraft.quiz.length <= 1) return;
		commitUpdatedQuizCollection(
			lessonDraft.quiz.filter((_quizQuestionEntry, currentQuestionIndex) => currentQuestionIndex !== questionIndex)
		);
	};

	const addQuizOption = (questionIndex: number): void => {
		const nextQuizCollection = lessonDraft.quiz.map((quizQuestionEntry, currentQuestionIndex) =>
			currentQuestionIndex === questionIndex
				? {
						...quizQuestionEntry,
						options: [
							...quizQuestionEntry.options,
							createDefaultQuizOptionEntry(quizQuestionEntry.options.length)
						]
					}
				: quizQuestionEntry
		);
		commitUpdatedQuizCollection(nextQuizCollection);
	};

	const removeQuizOption = (questionIndex: number, optionIndex: number): void => {
		const quizQuestionEntry = lessonDraft.quiz[questionIndex];
		if (!quizQuestionEntry || quizQuestionEntry.options.length <= 2) return;

		const nextQuizCollection = lessonDraft.quiz.map((currentQuizQuestionEntry, currentQuestionIndex) => {
			if (currentQuestionIndex !== questionIndex) return currentQuizQuestionEntry;
			const filteredOptions = currentQuizQuestionEntry.options.filter(
				(_quizOptionEntry, currentOptionIndex) => currentOptionIndex !== optionIndex
			);
			const normalizedOptions = filteredOptions.map((quizOptionEntry, normalizedOptionIndex) => ({
				...quizOptionEntry,
				optionId: String.fromCharCode(65 + normalizedOptionIndex)
			}));
			const normalizedCorrectOptionId = normalizedOptions.some(
				(quizOptionEntry) => quizOptionEntry.optionId === currentQuizQuestionEntry.correctOptionId
			)
				? currentQuizQuestionEntry.correctOptionId
				: normalizedOptions[0].optionId;
			return {
				...currentQuizQuestionEntry,
				options: normalizedOptions,
				correctOptionId: normalizedCorrectOptionId
			};
		});
		commitUpdatedQuizCollection(nextQuizCollection);
	};
</script>

<fieldset class="lesson-fieldset">
	<legend>Quiz</legend>
	{#each lessonDraft.quiz as quizQuestionEntry, questionIndex}
		<div class="lesson-group-card">
			<h4>Question {questionIndex + 1}</h4>
			<label for={`quiz-question-prompt-${questionIndex}`}>Question Prompt</label>
			<textarea
				id={`quiz-question-prompt-${questionIndex}`}
				value={quizQuestionEntry.questionPrompt}
				oninput={(event) =>
					updateQuizQuestionField(
						questionIndex,
						"questionPrompt",
						(event.currentTarget as HTMLTextAreaElement).value
					)}
				required
			></textarea>

			{#each quizQuestionEntry.options as quizOptionEntry, optionIndex}
				<div class="lesson-nested-card">
					<h5>Option {quizOptionEntry.optionId}</h5>
					<label for={`quiz-option-text-${questionIndex}-${optionIndex}`}>Option Text</label>
					<input
						id={`quiz-option-text-${questionIndex}-${optionIndex}`}
						type="text"
						value={quizOptionEntry.optionText}
						oninput={(event) =>
							updateQuizOptionText(questionIndex, optionIndex, (event.currentTarget as HTMLInputElement).value)}
						required
					/>
					<button type="button" onclick={() => removeQuizOption(questionIndex, optionIndex)}>
						Remove Option
					</button>
				</div>
			{/each}

			<label for={`quiz-correct-option-${questionIndex}`}>Correct Option</label>
			<select
				id={`quiz-correct-option-${questionIndex}`}
				value={quizQuestionEntry.correctOptionId}
				onchange={(event) =>
					updateQuizQuestionField(
						questionIndex,
						"correctOptionId",
						(event.currentTarget as HTMLSelectElement).value
					)}
			>
				{#each quizQuestionEntry.options as quizOptionEntry}
					<option value={quizOptionEntry.optionId}>{quizOptionEntry.optionId}</option>
				{/each}
			</select>

			<label for={`quiz-rationale-${questionIndex}`}>Rationale</label>
			<textarea
				id={`quiz-rationale-${questionIndex}`}
				value={quizQuestionEntry.rationale}
				oninput={(event) =>
					updateQuizQuestionField(questionIndex, "rationale", (event.currentTarget as HTMLTextAreaElement).value)}
				required
			></textarea>

			<div class="lesson-inline-actions">
				<button type="button" onclick={() => addQuizOption(questionIndex)}>Add Option</button>
				<button type="button" onclick={() => removeQuizQuestion(questionIndex)}>Remove Question</button>
			</div>
		</div>
	{/each}

	<button type="button" onclick={addQuizQuestion}>Add Quiz Question</button>
</fieldset>

<style>
	.lesson-fieldset {
		border: 1px solid var(--border-clear);
		border-radius: var(--radius-1);
		padding: 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.lesson-group-card,
	.lesson-nested-card {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		border: 1px solid var(--border-clear);
		border-radius: var(--radius-1);
		padding: 0.6rem;
	}

	.lesson-inline-actions {
		display: flex;
		gap: 0.5rem;
	}
</style>
