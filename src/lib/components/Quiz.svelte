<script lang="ts">
  import { slide } from "svelte/transition";
  import type { QuizQuestion } from "$lib/components/AticleAssets";
  import confetti from "canvas-confetti";

  let { questions }: { questions: QuizQuestion[] } = $props();

  let currentIndex = $state(0);
  let score = $state(0);
  let selectedOption = $state<number | null>(null);
  let isAnswered = $state(false);
  let quizComplete = $state(false);
  let showFailOverlay = $state(false);

  // Ref for the explanation box — bound in template
  let explanationEl = $state<HTMLDivElement | null>(null);

  let currentQuestion = $derived(questions[currentIndex]);

  // Progress relative to current question
  let progressPercent = $derived(
    quizComplete 
      ? 100 
      : ((currentIndex + (isAnswered ? 1 : 0)) / questions.length) * 100
  );

  function selectOption(index: number) {
    if (isAnswered) return;
    selectedOption = index;
    isAnswered = true;

    if (index === currentQuestion.correctIndex) {
      score += 1;
    }

    // REMOVED: tick() and window.scrollTo() from here.
    // The scrolling is now handled by the onintroend event in the HTML below.
  }

  function triggerSuccessStars() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = "connection" in navigator && (navigator as Navigator & {
      connection?: { saveData?: boolean };
    }).connection?.saveData;
    const lowCpu = (navigator.hardwareConcurrency ?? 8) <= 4;
    const lowMemory = "deviceMemory" in navigator && ((navigator as Navigator & {
      deviceMemory?: number;
    }).deviceMemory ?? 8) <= 4;
    const shouldUseLightEffect = prefersReducedMotion || !!saveData || lowCpu || lowMemory;

    const duration = shouldUseLightEffect ? 900 : 1800;
    const end = Date.now() + duration;
    const particleCount = shouldUseLightEffect ? 2 : 4;
    const tickCount = shouldUseLightEffect ? 120 : 170;

    (function frame() {
      confetti({
        particleCount,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ['#FFD700', '#FFE400', '#F0C987', '#FFFFFF'],
        gravity: 0.9,
        scalar: 1,
        ticks: tickCount,
        zIndex: 9999
      });
      confetti({
        particleCount,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ['#FFD700', '#FFE400', '#F0C987', '#FFFFFF'],
        gravity: 0.9,
        scalar: 1,
        ticks: tickCount,
        zIndex: 9999
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }

  function nextQuestion() {
    if (currentIndex < questions.length - 1) {
      currentIndex++;
      selectedOption = null;
      isAnswered = false;
    } else {
      quizComplete = true;
      if (score === questions.length) {
        triggerSuccessStars();
      } else {
        triggerFailOverlay();
      }
    }
  }

  function triggerFailOverlay() {
    showFailOverlay = true;
    setTimeout(() => {
      showFailOverlay = false;
    }, 2000);
  }

  function restartQuiz() {
    currentIndex = 0;
    score = 0;
    selectedOption = null;
    isAnswered = false;
    quizComplete = false;
  }
</script>

{#if showFailOverlay}
  <div class="damage-overlay"></div>
{/if}

<div class="quiz-container">
  <h2 class="quiz-title">Repaso</h2>

  {#if !quizComplete}
    <div class="quiz-card" transition:slide>
      
      <!-- Progress Bar -->
      <div class="progress-track" aria-hidden="true">
        <div class="progress-fill" style="width: {progressPercent}%"></div>
      </div>

      <div class="quiz-header">
        <div class="quiz-progress">
          Pregunta {currentIndex + 1} de {questions.length}
        </div>
      </div>
      
      <p class="question-text">{currentQuestion.question}</p>

      <div class="options">
        {#each currentQuestion.options as option, index}
          <button
            class="option-btn"
            class:selected={selectedOption === index}
            class:correct={isAnswered && index === currentQuestion.correctIndex}
            class:wrong={isAnswered && selectedOption === index && index !== currentQuestion.correctIndex}
            disabled={isAnswered}
            onclick={() => selectOption(index)}
          >
            <b>{index + 1}. </b> {option}
          </button>
        {/each}
      </div>

      {#if isAnswered}
        <div 
          class="explanation-box" 
          transition:slide 
          bind:this={explanationEl}
          onintroend={() => explanationEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })}
        >
          <strong>
            {selectedOption === currentQuestion.correctIndex ? '¡Correcto!' : 'Incorrecto.'}
          </strong>
          <p>{currentQuestion.explanation}</p>
          <button class="next-btn" onclick={nextQuestion}>
            {currentIndex < questions.length - 1 ? 'Siguiente Pregunta' : 'Ver Resultados'}
          </button>
        </div>
      {/if}
    </div>
  {:else}
    <div class="quiz-results" transition:slide>
      <div class="progress-track" aria-hidden="true">
        <div class="progress-fill final-progress"></div>
      </div>

      <h3 class="results-title">¡Completaste el Repaso!</h3>
      <p class="score-display">Puntaje: {score} / {questions.length}</p>
      
      <p class="score-message">
        {#if score === questions.length}
          ¡Excelente retención del mensaje!
        {:else if score > 0}
          Buen trabajo, pero sigue repasando estos conceptos.
        {:else}
          Te invitamos a volver a escuchar o leer la lección.
        {/if}
      </p>

      <button class="next-btn" onclick={restartQuiz}>Intentar de nuevo</button>
    </div>
  {/if}
</div>

<style>
   .quiz-container {
    margin-top: var(--big-top-margin);
  }
</style>