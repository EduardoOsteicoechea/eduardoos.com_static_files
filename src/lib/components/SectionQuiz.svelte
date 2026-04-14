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
    const duration = 2500;
    const end = Date.now() + duration;

    // Create an elegant diamond shape for the confetti
    const diamond = confetti.shapeFromPath({ path: 'M 10 0 L 20 10 L 10 20 L 0 10 Z' });

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ['#FFD700', '#FFE400', '#F0C987', '#FFFFFF'],
        shapes: [diamond],
        gravity: 0.9,
        scalar: 1,
        ticks: 200,
        zIndex: 9999
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ['#FFD700', '#FFE400', '#F0C987', '#FFFFFF'],
        shapes: [diamond],
        gravity: 0.9,
        scalar: 1,
        ticks: 200,
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

<style>
  .damage-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100svh;
    pointer-events: none;
    z-index: 99999;
    background: radial-gradient(circle at center, transparent 40%, rgba(200, 0, 0, 0.6) 100%);
    box-shadow: inset 0 0 100px rgba(200, 0, 0, 0.5);
    animation: damage-pulse 2s forwards;
  }

  @keyframes damage-pulse {
    0% { opacity: 0; }
    15% { opacity: 1; transform: scale(1.05); }
    100% { opacity: 0; transform: scale(1); }
  }

  .section-quiz-container {
    margin-top: 0px;
    margin-bottom: 0px;
    /* border-top: 1px dashed #ced4da; */
    padding-top: 00px;
  }

  .start-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 12px;
    background-color: var(--start-btn-bg);
    border: 1px solid var(--option-border);
    border-radius: 4px;
    color: var(--text-muted);
    font-size: calc(15px * var(--text-zoom, 1));
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s, border-color 0.2s;
  }

  .start-btn:hover {
    background-color: var(--start-btn-hover-bg);
    border-color: var(--option-hover-border);
    color: var(--text-main);
  }

  .quiz-card {
    background-color: var(--quiz-bg);
    border: 1px solid var(--quiz-border);
    border-radius: 4px;
    overflow: hidden;
    /* Box shadow to subtly differentiate it from the white accordion background */
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }

  .progress-track {
    width: 100%;
    height: 4px;
    background-color: var(--track-bg);
  }

  .progress-fill {
    height: 100%;
    background-color: var(--primary-color);
    transition: width 0.3s ease;
  }

  .progress-fill.final-progress {
    width: 100%;
    background-color: var(--success-color);
  }

  .quiz-header {
    padding: 12px 15px 0;
  }

  .quiz-progress-text {
    font-size: calc(0.8rem * var(--text-zoom, 1));
    color: var(--text-muted);
    font-weight: 500;
  }

  .question-text {
    padding: 10px 15px;
    font-size: calc(16px * var(--text-zoom, 1));
    font-weight: 600;
    color: var(--text-main);
    margin: 0;
  }

  .options {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 0 15px 15px;
  }

  .option-btn {
    text-align: left;
    padding: 10px 12px;
    border: 1px solid var(--option-border);
    background-color: var(--option-bg);
    border-radius: 4px;
    font-size: calc(15px * var(--text-zoom, 1));
    cursor: pointer;
    transition: all 0.2s;
    color: var(--text-main);
    font-family: inherit;
  }

  .option-btn:not(:disabled):hover {
    background-color: var(--option-hover-bg);
    border-color: var(--option-hover-border);
  }

  .option-btn:disabled {
    cursor: default;
  }

  .option-btn:disabled:not(.correct):not(.wrong) {
    background-color: var(--track-bg);
    border-color: var(--border-color);
    color: var(--text-disabled);
    opacity: 0.8;
  }

  .option-btn.correct {
    background-color: var(--option-correct-bg);
    border-color: var(--option-correct-border);
    color: var(--option-correct-color);
  }

  .option-btn.wrong {
    background-color: var(--option-wrong-bg);
    border-color: var(--option-wrong-border);
    color: var(--option-wrong-color);
  }

  .explanation-box {
    padding: 15px;
    background-color: var(--explanation-bg);
    border-top: 1px solid var(--quiz-border);
  }

  .explanation-box strong {
    display: block;
    margin-bottom: 8px;
    font-size: calc(15px * var(--text-zoom, 1));
  }

  .explanation-box p {
    margin: 0 0 15px 0;
    font-size: calc(15px * var(--text-zoom, 1));
    color: var(--text-main);
  }

  .next-btn {
    display: block;
    width: 100%;
    padding: 10px;
    background-color: var(--primary-color);
    color: #fff;
    border: none;
    border-radius: 4px;
    font-weight: 600;
    font-size: calc(15px * var(--text-zoom, 1));
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .next-btn:hover {
    background-color: var(--primary-hover);
  }

  .next-btn.outline {
    background-color: transparent;
    color: var(--text-main);
    border: 1px solid var(--option-border);
    margin-top: 15px;
  }

  .next-btn.outline:hover {
    background-color: var(--option-hover-bg);
    color: var(--text-main);
  }

  .quiz-results {
    text-align: center;
    padding: 0 10px 10px 10px;
  }

  .quiz-results h3 {
    margin: 20px 0 10px;
    font-size: calc(18px * var(--text-zoom, 1));
    color: var(--text-main);
  }

  .score-display {
    font-size: calc(20px * var(--text-zoom, 1));
    font-weight: 700;
    color: var(--primary-color);
    margin: 0 0 15px;
  }
</style>
