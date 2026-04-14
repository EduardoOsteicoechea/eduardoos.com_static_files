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
   .quiz-container {
    margin: 20px 0 0 0;
  }
</style>