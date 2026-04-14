<script lang="ts">
  import { slide } from "svelte/transition";
  import { tick } from "svelte";
  import type { QuizQuestion } from "../../routes/bible-series-romans-paul/+page";
  import confetti from "canvas-confetti";

  let { questions }: { questions: QuizQuestion[] } = $props();

  let isStarted = $state(false);
  let currentIndex = $state(0);
  let score = $state(0);
  let selectedOption = $state<number | null>(null);
  let isAnswered = $state(false);
  let quizComplete = $state(false);
  let showFailOverlay = $state(false);

  // Ref for the explanation box — bound in template
  let explanationEl = $state<HTMLDivElement | null>(null);

  // Progress relative to current question
  let progressPercent = $derived(
    quizComplete 
      ? 100 
      : ((currentIndex + (isAnswered ? 1 : 0)) / questions.length) * 100
  );

  let currentQuestion = $derived(questions[currentIndex]);

  function startQuiz() {
    isStarted = true;
  }

  async function selectOption(index: number) {
    if (isAnswered) return;
    selectedOption = index;
    isAnswered = true;

    if (index === currentQuestion.correctIndex) {
      score += 1;
    }

    // Wait for Svelte to render the explanation box, but don't scroll into view wildly
    // scrollIntoView can push the user around during accordion reading, 
    // so we just let it appear smoothly.
    await tick();
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
    isStarted = false;
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

<div class="section-quiz-container">
  {#if !isStarted}
    <!-- Collapsed State -->
    <button class="start-btn" onclick={startQuiz}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
        <path d="M9 11l3 3L22 4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
      Evaluar esta sección
    </button>
  {:else}
    <!-- Expanded State -->
    <div class="quiz-card" transition:slide>
      
      <!-- Progress Bar -->
      <div class="progress-track" aria-hidden="true">
        <div class="progress-fill" style="width: {progressPercent}%"></div>
      </div>

      {#if !quizComplete}
        <div class="quiz-header">
          <span class="quiz-progress-text">Pregunta {currentIndex + 1} de {questions.length}</span>
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
              <b>{index + 1}.</b> {option}
            </button>
          {/each}
        </div>

        {#if isAnswered}
          <div 
            class="explanation-box" 
            transition:slide 
            bind:this={explanationEl}
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
      {:else}
        <!-- Results State -->
        <div class="quiz-results" transition:slide>
          <div class="progress-track" aria-hidden="true">
            <div class="progress-fill final-progress"></div>
          </div>
          <h3>¡Sección Evaluada!</h3>
          <p class="score-display">Puntaje: {score} / {questions.length}</p>
          <button class="next-btn outline" onclick={restartQuiz}>Cerrar Evaluación</button>
        </div>
      {/if}
    </div>
  {/if}
</div>


