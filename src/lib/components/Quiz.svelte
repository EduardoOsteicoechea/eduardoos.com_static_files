<script lang="ts">
  import { slide } from "svelte/transition";
  import type { QuizQuestion } from "../../routes/bible-series-romans-paul/+page";

  let { questions }: { questions: QuizQuestion[] } = $props();

  let currentIndex = $state(0);
  let score = $state(0);
  let selectedOption = $state<number | null>(null);
  let isAnswered = $state(false);
  let quizComplete = $state(false);

  let currentQuestion = $derived(questions[currentIndex]);

  function selectOption(index: number) {
    if (isAnswered) return; // Prevent changing answer
    selectedOption = index;
    isAnswered = true;
    
    if (index === currentQuestion.correctIndex) {
      score += 1;
    }
  }

  function nextQuestion() {
    if (currentIndex < questions.length - 1) {
      currentIndex++;
      selectedOption = null;
      isAnswered = false;
    } else {
      quizComplete = true;
    }
  }

  function restartQuiz() {
    currentIndex = 0;
    score = 0;
    selectedOption = null;
    isAnswered = false;
    quizComplete = false;
  }
</script>

<div class="quiz-container">
  <h2 class="quiz-title">Repaso de la Lección</h2>

  {#if !quizComplete}
    <div class="quiz-card" transition:slide>
      <div class="quiz-progress">
        Pregunta {currentIndex + 1} de {questions.length}
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
            {option}
          </button>
        {/each}
      </div>

      {#if isAnswered}
        <div class="explanation-box" transition:slide>
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
      <h3>¡Completaste el Repaso!</h3>
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
    margin-top: 2rem;
    padding: 1.5rem 1rem;
    background-color: #f8f9fa;
    border-radius: 4px;
    border: 1px solid #e9ecef;
  }

  .quiz-title {
    margin-top: 0;
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
    color: #212529;
  }

  .quiz-progress {
    font-size: 0.875rem;
    color: #6c757d;
    margin-bottom: 0.5rem;
  }

  .question-text {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    color: #212529;
  }

  .options {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .option-btn {
    text-align: left;
    padding: 1rem;
    border: 2px solid #dee2e6;
    background-color: white;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;
    color: #495057;
  }

  .option-btn:not(:disabled):hover {
    background-color: #f1f3f5;
    border-color: #ced4da;
  }

  .option-btn:disabled {
    cursor: default;
  }

  /* Estados de respuesta */
  .option-btn.correct {
    background-color: #d4edda;
    border-color: #28a745;
    color: #155724;
  }

  .option-btn.wrong {
    background-color: #f8d7da;
    border-color: #dc3545;
    color: #721c24;
  }

  .explanation-box {
    margin-top: 1.5rem;
    padding: 1rem;
    background-color: white;
    border-radius: 4px;
    border-left: 4px solid #0d6efd;
  }

  .explanation-box p {
    margin-top: 0.5rem;
    margin-bottom: 1rem;
    font-size: 0.95rem;
    color: #495057;
  }

  .next-btn {
    display: inline-block;
    width: 100%;
    padding: 0.75rem;
    background-color: #0d6efd;
    color: white;
    border: none;
    border-radius: 4px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .next-btn:hover {
    background-color: #0b5ed7;
  }

  .quiz-results {
    text-align: center;
    padding: 2rem 1rem;
  }

  .score-display {
    font-size: 2rem;
    font-weight: bold;
    color: #0d6efd;
    margin: 1rem 0;
  }

  .score-message {
    color: #495057;
    margin-bottom: 2rem;
  }
</style>