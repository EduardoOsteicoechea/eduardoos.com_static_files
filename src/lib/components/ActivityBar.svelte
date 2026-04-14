<script lang="ts">
   import { audioState, toggleAudio } from "$lib/state/audio.svelte";

   // --- Scroll progress ---
   let scrollPercent = $state(0);

   function onScroll() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = Math.max(
         document.body.scrollHeight,
         document.documentElement.scrollHeight,
      );
      const clientHeight =
         window.innerHeight || document.documentElement.clientHeight;
      const scrollable = scrollHeight - clientHeight;
      let percent = scrollable > 0 ? (scrollTop / scrollable) * 100 : 0;
      scrollPercent = Math.min(100, Math.max(0, percent));
   }

   // --- Scroll jump helpers ---
   function scrollToTop() {
      window.scrollTo({ top: 0, behavior: "instant" });
   }

   function scrollToBottom() {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" });
   }

   // --- Text zoom ---
   let textZoom = $state(1);

   function increaseFontSize() {
      textZoom = Math.min(2.0, textZoom + 0.1);
   }

   function decreaseFontSize() {
      textZoom = Math.max(0.7, textZoom - 0.1);
   }

   $effect(() => {
      document.documentElement.style.setProperty(
         "--text-zoom",
         textZoom.toString(),
      );
   });

   let isDarkMode = $state(false);

   $effect(() => {
      // In sync with app.html logic
      isDarkMode = document.documentElement.classList.contains("dark");
   });

   function toggleTheme() {
      if (typeof document !== "undefined") {
         document.documentElement.classList.toggle("dark");
         isDarkMode = document.documentElement.classList.contains("dark");
         localStorage.setItem("theme", isDarkMode ? "dark" : "light");
      }
   }

   // WhatsApp link
   const waUrl = "https://wa.me/+584147281033";
</script>

<svelte:window onscroll={onScroll} />

<div class="activity-bar" role="toolbar" aria-label="Barra de actividad">
   <!-- WhatsApp CTA -->
   <a
      class="bar-btn wa-btn activity-bar-item"
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Hablemos por WhatsApp"
      title="Hablemos por WhatsApp"
   >
      <button>
         <!-- WhatsApp logo SVG -->
         <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            width="22"
            height="22"
            aria-hidden="true"
         >
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
         <!-- <span class="btn-label">WhatsApp</span> -->
      </button>
   </a>

   <div class="activity-bar-item activity-bar-item-with-border">
      <!-- Scroll to top -->
      <!-- Scroll to top -->
      <!-- Scroll to top -->
      <!-- Scroll to top -->
      <button
         class="bar-btn nav-btn"
         onclick={scrollToTop}
         aria-label="Ir al inicio de la página"
         title="Ir al inicio"
      >
         <!-- Chevron up -->
         <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            width="20"
            height="20"
            aria-hidden="true"
         >
            <polyline points="18 15 12 9 6 15" />
         </svg>
      </button>
      <!-- Scroll to bottom -->
      <!-- Scroll to bottom -->
      <!-- Scroll to bottom -->
      <!-- Scroll to bottom -->
      <button
         class="bar-btn nav-btn"
         onclick={scrollToBottom}
         aria-label="Ir al final de la página"
         title="Ir al final"
      >
         <!-- Chevron down -->
         <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            width="20"
            height="20"
            aria-hidden="true"
         >
            <polyline points="6 9 12 15 18 9" />
         </svg>
      </button>
   </div>

   <div class="activity-bar-item activity-bar-item-with-border">
      <!-- Increase Font -->
      <button
         class="bar-btn nav-btn"
         onclick={increaseFontSize}
         aria-label="Aumentar tamaño de texto"
         title="Aumentar texto"
      >
         <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            width="20"
            height="20"
            aria-hidden="true"
         >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
         </svg>
      </button>
      <!-- Decrease Font -->
      <button
         class="bar-btn nav-btn"
         onclick={decreaseFontSize}
         aria-label="Reducir tamaño de texto"
         title="Reducir texto"
      >
         <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            width="20"
            height="20"
            aria-hidden="true"
         >
            <line x1="5" y1="12" x2="19" y2="12"></line>
         </svg>
      </button>

      <!-- Theme Toggle -->
      <button
         class="bar-btn nav-btn activity-bar-item activity-bar-item-with-border"
         onclick={toggleTheme}
         aria-label="Alternar tema oscuro"
         title="Alternar tema"
      >
         {#if isDarkMode}
            <svg
               viewBox="0 0 24 24"
               fill="none"
               stroke="currentColor"
               stroke-width="2.5"
               stroke-linecap="round"
               stroke-linejoin="round"
               width="18"
               height="18"
               aria-hidden="true"
            >
               <circle cx="12" cy="12" r="5"></circle>
               <line x1="12" y1="1" x2="12" y2="3"></line>
               <line x1="12" y1="21" x2="12" y2="23"></line>
               <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
               <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
               <line x1="1" y1="12" x2="3" y2="12"></line>
               <line x1="21" y1="12" x2="23" y2="12"></line>
               <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
               <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
         {:else}
            <svg
               viewBox="0 0 24 24"
               fill="none"
               stroke="currentColor"
               stroke-width="2.5"
               stroke-linecap="round"
               stroke-linejoin="round"
               width="18"
               height="18"
               aria-hidden="true"
            >
               <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
         {/if}
      </button>
      
   </div>

   <!-- Audio play/pause -->
   <!-- Audio play/pause -->
   <!-- Audio play/pause -->
   <!-- Audio play/pause -->
   <button
      class="bar-btn audio-btn activity-bar-item"
      onclick={toggleAudio}
      aria-label={audioState.paused ? "Reproducir audio" : "Pausar audio"}
      title={audioState.paused ? "Reproducir" : "Pausar"}
   >
      {#if audioState.paused}
         <!-- Play -->
         <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            width="22"
            height="22"
            aria-hidden="true"
         >
            <path d="M8 5v14l11-7z" />
         </svg>
      {:else}
         <!-- Pause -->
         <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            width="22"
            height="22"
            aria-hidden="true"
         >
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
         </svg>
      {/if}
      <!-- <span class="btn-label">{audioState.paused ? "Reproducir" : "Pausar"}</span> -->
   </button>

   <!-- Scroll progress line -->
   <!-- Scroll progress line -->
   <!-- Scroll progress line -->
   <!-- Scroll progress line -->
   <div class="scroll-track">
      <div class="scroll-fill" style="width: {scrollPercent}%"></div>
   </div>
</div>

<style>
   /* ─── Bar shell ─────────────────────────────────────────────── */
   .activity-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 55px;
      z-index: 50;

      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 0 10px 2px 10px;

      background-color: var(--activity-bar-bg);
      color: var(--text-color);

      /* Subtle top border instead of box-shadow so it doesn't bleed */
      border-top: 1px solid var(--border-clear);
   }

   /* ─── Scroll progress ───────────────────────────────────────── */
   .scroll-track {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 3px;
      background: rgba(255, 255, 255, 0.12);
      overflow: hidden;
   }

   .scroll-fill {
      height: 100%;
      background: var(
         --biblio-quote-color
      ); /* matches .biblio-quote accent colour in app.css */
      transition: width 0.1s linear;
      border-radius: 0 2px 2px 0;
   }

   /* ─── Activity Bar Item ───────────────────────────────────── */
   .activity-bar-item {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: 0px;
   }
   .activity-bar-item-with-border {
      /* border: solid 1px var(--border-clear) !important; */
      border-radius: 4px;
   }

   /* ─── Shared button reset ───────────────────────────────────── */
   .bar-btn {
      display: flex;
      align-items: center;
      background-color: var(--btn-hover-bg);
      color: inherit;
      cursor: pointer;
      font-family: inherit;
      transition:
         background 0.15s ease,
         color 0.15s ease,
         transform 0.15s ease;
      text-decoration: none;
   }

   .bar-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-1px);
   }

   .bar-btn:active {
      transform: translateY(0);
      background: rgba(255, 255, 255, 0.06);
   }

   /* ─── Audio button ──────────────────────────────────────────── */
   .audio-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      /* min-width: 110px; */
   }
   .audio-btn:hover {
      background-color: #25d366;
   }

   /* ─── WhatsApp button ───────────────────────────────────────── */
   .wa-btn {
      color: var(--btn-nav-color);
   }

   .wa-btn:hover {
      color: var(--btn-nav-hover);
   }

   /* ─── Nav buttons ───────────────────────────────────────────── */
   .nav-btn {
      padding: 0 0;
      min-width: 30px;
      justify-content: center;
      color: var(--btn-nav-color);
   }

   .nav-btn:hover {
      color: var(--btn-nav-hover);
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

   @media (max-width: 768px) {
      .wa-btn .btn-label {
         display: none;
      }
      /* .wa-btn {
         min-width: 30px;
         padding: 0 0px;
      } */
   }

   @media (max-width: 360px) {
      .btn-label {
         display: none;
      }
      /* .audio-btn {
         min-width: 30px;
         padding: 0 0px;
      } */
   }
</style>


