<script lang="ts">
  import type { BimElementSummary } from "$lib/types/bim";

  let {
    elements,
    selectedId,
    onSelect,
  }: {
    elements: BimElementSummary[];
    selectedId: string | null;
    onSelect: (id: string) => void;
  } = $props();

  let isExpanded = $state(true);

  function toggleExpanded() {
    isExpanded = !isExpanded;
  }
</script>

<aside
  class="bim-sidebar"
  class:bim-sidebar--collapsed={!isExpanded}
  aria-label="BIM elements"
>
  <div class="bim-sidebar__toolbar">
    <button
      type="button"
      class="bim-sidebar__toggle"
      onclick={toggleExpanded}
      aria-expanded={isExpanded}
      aria-label={isExpanded ? "Collapse element list" : "Expand element list"}
      title={isExpanded ? "Collapse" : "Expand"}
    >
      <span class="bim-sidebar__chevron" aria-hidden="true">
        {#if isExpanded}
          ‹
        {:else}
          ›
        {/if}
      </span>
    </button>
  </div>

  {#if isExpanded}
    <h2 class="bim-sidebar__title">Elements</h2>
    <ul class="bim-sidebar__list">
      {#each elements as el (el.id)}
        <li>
          <button
            type="button"
            class="bim-sidebar__item"
            class:bim-sidebar__item--active={selectedId === el.id}
            onclick={() => onSelect(el.id)}
          >
            {el.displayName}
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</aside>

<style>
  .bim-sidebar {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
    min-height: 0;
    width: min(280px, 40vw);
    max-height: 100%;
    border-right: 1px solid rgb(255 255 255 / 0.12);
    background: rgb(12 16 26 / 0.96);
    color: #e8ecf4;
    overflow: hidden;
    transition: width 0.22s ease;
  }

  .bim-sidebar--collapsed {
    width: 48px;
  }

  .bim-sidebar__toolbar {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    padding: 4px;
  }

  .bim-sidebar__toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 36px;
    margin: 0;
    padding: 0;
    border: none;
    border-radius: 8px;
    background: rgb(255 255 255 / 0.08);
    color: inherit;
    cursor: pointer;
    transition: background 0.12s ease;
  }

  .bim-sidebar__toggle:hover {
    background: rgb(255 255 255 / 0.14);
  }

  .bim-sidebar__chevron {
    font-size: 1.35rem;
    line-height: 1;
    font-weight: 700;
    user-select: none;
  }

  .bim-sidebar__title {
    flex-shrink: 0;
    margin: 0;
    padding: 0 14px 8px;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: rgb(255 255 255 / 0.55);
  }

  .bim-sidebar__list {
    list-style: none;
    margin: 0;
    padding: 0 8px 12px;
    overflow: auto;
    flex: 1;
    min-height: 0;
  }

  .bim-sidebar__item {
    display: block;
    width: 100%;
    margin: 0 0 4px;
    padding: 10px 12px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
    transition: background 0.12s ease;
  }

  .bim-sidebar__item:hover {
    background: rgb(255 255 255 / 0.06);
  }

  .bim-sidebar__item--active {
    background: rgb(0 85 255 / 0.22);
    box-shadow: inset 0 0 0 1px rgb(0 120 255 / 0.35);
  }
</style>
