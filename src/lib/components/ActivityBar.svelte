<script lang="ts">
  // Props from parent
  interface Props {
    isPaused: boolean;
    toggleAudio: () => void;
  }

  let { isPaused, toggleAudio }: Props = $props();

  // --- Scroll progress ---
  let scrollPercent = $state(0);

  function onScroll() {
    const el = document.documentElement;
    const scrollable = el.scrollHeight - el.clientHeight;
    scrollPercent = scrollable > 0 ? (el.scrollTop / scrollable) * 100 : 0;
  }

  // --- Scroll jump helpers ---
  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function scrollToBottom() {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" });
  }

  // WhatsApp link
  const waUrl = "https://wa.me/+584147281033";
</script>

<svelte:window onscroll={onScroll} />

<div class="activity-bar" role="toolbar" aria-label="Barra de actividad">
  <!-- Scroll progress line at the very top of the bar -->
  <div class="scroll-track">
    <div class="scroll-fill" style="width: {scrollPercent}%"></div>
  </div>

  <!-- Divider -->
  <div class="bar-divider" aria-hidden="true"></div>

  <!-- WhatsApp CTA -->
  <a
    class="bar-btn wa-btn"
    href={waUrl}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Hablemos por WhatsApp"
    title="Hablemos por WhatsApp"
  >
    <!-- WhatsApp logo SVG -->
    <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22" aria-hidden="true">
      <path
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.47-.148-.668.15-.198.297-.766.967-.94
        1.165-.174.198-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198
        0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213
        3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227
        1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"
      />
      <path
        d="M12 0C5.373 0 0 5.373 0 12c0 2.117.554 4.103 1.523 5.824L.057 23.428a.75.75 0
        00.916.916l5.604-1.466A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627
        0 12 0zm0 21.75a9.713 9.713 0 01-4.953-1.354l-.355-.211-3.677.963.979-3.578-.231-.368A9.712
        9.712 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385
        21.75 12 21.75z"
      />
    </svg>
    <span class="btn-label">WhatsApp</span>
  </a>

  <!-- Divider -->
  <div class="bar-divider" aria-hidden="true"></div>

  <!-- Scroll to top -->
  <button
    class="bar-btn nav-btn"
    onclick={scrollToTop}
    aria-label="Ir al inicio de la página"
    title="Ir al inicio"
  >
    <!-- Chevron up -->
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
      stroke-linecap="round" stroke-linejoin="round" width="20" height="20" aria-hidden="true">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  </button>

  <!-- Scroll to bottom -->
  <button
    class="bar-btn nav-btn"
    onclick={scrollToBottom}
    aria-label="Ir al final de la página"
    title="Ir al final"
  >
    <!-- Chevron down -->
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
      stroke-linecap="round" stroke-linejoin="round" width="20" height="20" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  </button>

  <!-- Audio play/pause -->
  <!-- Audio play/pause -->
  <!-- Audio play/pause -->
  <!-- Audio play/pause -->
  <button
    class="bar-btn audio-btn"
    onclick={toggleAudio}
    aria-label={isPaused ? "Reproducir audio" : "Pausar audio"}
    title={isPaused ? "Reproducir" : "Pausar"}
  >
    {#if isPaused}
      <!-- Play -->
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22" aria-hidden="true">
        <path d="M8 5v14l11-7z" />
      </svg>
    {:else}
      <!-- Pause -->
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22" aria-hidden="true">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
      </svg>
    {/if}
    <span class="btn-label">{isPaused ? "Reproducir" : "Pausar"}</span>
  </button>
</div>

<style>
  /* ─── Bar shell ─────────────────────────────────────────────── */
  .activity-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 50px;
    z-index: 50;

    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 5px;
    padding: 0 5px;

    background-color: #f0f0f0;
    color: #000;

    /* Subtle top border instead of box-shadow so it doesn't bleed */
    border-top: 1px solid #bebebe; 
   }

  /* ─── Scroll progress ───────────────────────────────────────── */
  .scroll-track {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: rgba(255, 255, 255, 0.12);
    overflow: hidden;
  }

  .scroll-fill {
    height: 100%;
    background: rgb(47, 0, 255); /* matches .biblio-quote accent colour in app.css */
    transition: width 0.1s linear;
    border-radius: 0 2px 2px 0;
  }

  /* ─── Shared button reset ───────────────────────────────────── */
  .bar-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0 0px;
    height: 35px;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: inherit;
    cursor: pointer;
    font-size: 13px;
    font-family: inherit;
    white-space: nowrap;
    transition: background 0.15s ease, color 0.15s ease, transform 0.15s ease;
    text-decoration: none;
  }

  .bar-btn:hover {
    background: rgba(255, 255, 255, 0.10);
    transform: translateY(-1px);
  }

  .bar-btn:active {
    transform: translateY(0);
    background: rgba(255, 255, 255, 0.06);
  }

  /* ─── Audio button ──────────────────────────────────────────── */
  .audio-btn {
   display:flex;
   align-items: center;
   justify-content: center;
    min-width: 110px;
  }
  .audio-btn:hover {
    background-color: #25d366;
  }


  /* ─── WhatsApp button ───────────────────────────────────────── */
  .wa-btn {
    color: #25d366;
    /* min-width: 120px; */
    /* width: auto; */
    margin-right: auto;
    /* border: solid 1px red */
  }

  .wa-btn:hover {
    /* background: rgba(37, 211, 102, 0.12);
    color: #2eeb72; */
  }

  /* ─── Nav buttons ───────────────────────────────────────────── */
  .nav-btn {
    padding: 0 0;
    min-width: 30px;
    justify-content: center;
    color: rgb(0, 0, 0)  }

  .nav-btn:hover {
    color: #003cff;
  }

  /* ─── Divider ───────────────────────────────────────────────── */
  .bar-divider {
    width: 1px;
    height: 22px;
    background: rgba(255, 255, 255, 0.15);
    flex-shrink: 0;
    margin: 0 4px;
  }

  /* ─── Label (hide on very small screens) ────────────────────── */
  .btn-label {
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.01em;
  }

  @media (max-width: 360px) {
    .btn-label {
      display: none;
    }
    .audio-btn,
    .wa-btn {
      min-width: 30px;
      padding: 0 0px;
    }
  }
</style>
