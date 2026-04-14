<script lang="ts">
  import { slide } from "svelte/transition";
  import { tick } from "svelte";
  import type { QuizQuestion } from "../../routes/bible-series-romans-paul/+page";
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

  async function selectOption(index: number) {
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
  <h2 class="quiz-title">Repaso de la Lección</h2>

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
            <b>{index + 1}.</b> {option}
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

  .quiz-container {
    /* margin-top: 2rem; */
    padding: 15px 15px;
    /* background-color: #f8f9fa; */
    /* border-radius: 4px; */
    /* border: 1px solid #e9ecef; */
  }

  .quiz-title {
    margin-top: 0;
    margin-bottom: 15px;
    font-size: calc(18px * var(--text-zoom, 1));
    color: var(--text-main);
  }

  .quiz-card {
    background-color: var(--quiz-bg);
    border: 1px solid var(--quiz-border);
    border-radius: 4px;
    overflow: hidden;
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
    transition: width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .progress-fill.final-progress {
    width: 100%;
    background-color: var(--success-color);
  }

  .quiz-header {
    padding: 15px 15px 0;
  }

  .quiz-progress {
    font-size: calc(0.875rem * var(--text-zoom, 1));
    color: var(--text-muted);
    font-weight: 500;
  }

  .question-text {
    padding: 10px 15px;
    font-size: calc(18px * var(--text-zoom, 1));
    font-weight: 600;
    margin-bottom: 15px;
    color: var(--text-main);
  }

  .options {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 0 15px 15px;
  }

  .option-btn {
    text-align: left;
    padding: 8px 10px;
    border: 1px solid var(--option-border);
    background-color: var(--option-bg);
    border-radius: 4px;
    font-size: calc(16px * var(--text-zoom, 1));
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

  /* Gray out neutral options once answered — correct/wrong keep their colours */
  .option-btn:disabled:not(.correct):not(.wrong) {
    background-color: var(--track-bg);
    border-color: var(--border-color);
    color: var(--text-disabled);
  }

  /* Estados de respuesta */
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
    margin-top: 1.5rem;
    padding: 1rem;
    background-color: var(--explanation-bg);
    border-radius: 4px;
    border-left: 4px solid var(--primary-color);
  }

  .explanation-box p {
    margin-top: 0.5rem;
    margin-bottom: 1rem;
    font-size: calc(16px * var(--text-zoom, 1));
    color: var(--text-main);
  }

  .next-btn {
    display: inline-block;
    width: 100%;
    padding: 0.75rem;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 4px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .next-btn:hover {
    background-color: var(--primary-hover);
  }

  .quiz-results {
    text-align: center;
    background-color: var(--quiz-bg);
    border: 1px solid var(--quiz-border);
    border-radius: 4px;
    overflow: hidden;
    padding: 10px;
  }

  .results-title {
    margin-top: 2rem;
    font-size: calc(22px * var(--text-zoom, 1));
    color: var(--text-main);
  }

  .score-display {
    font-size: calc(20px * var(--text-zoom, 1));
    font-weight: bold;
    color: var(--primary-color);
    margin: 1rem 0;
  }

  .score-message {
    color: var(--text-main);
    margin-bottom: 2rem;
    padding: 0 1rem;
  }
</style>