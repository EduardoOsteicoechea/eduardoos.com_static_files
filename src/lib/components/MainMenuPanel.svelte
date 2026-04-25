<script lang="ts">
  import { goto } from "$app/navigation";
  import { authStore } from "$lib/stores/auth";

  let {
    isOpen = false,
    onClose = () => {},
  }: {
    isOpen?: boolean;
    onClose?: () => void;
  } = $props();

  let isAuthenticatedUserSession = $state(authStore.isAuthenticated());

  const handleLogoutClick = async (): Promise<void> => {
    authStore.logout();
    onClose();
    await goto("/login");
  };

  $effect(() => {
    isAuthenticatedUserSession = authStore.isAuthenticated();
  });
</script>

{#if isOpen}
  <button
    class="main-menu-overlay"
    onclick={onClose}
    aria-label="Cerrar menu principal"
  ></button>
{/if}

<aside
  class="main-menu-panel"
  class:main-menu-panel-open={isOpen}
  aria-hidden={!isOpen}
>
  <div class="main-menu-header">
    <span class="main-menu-title">Menu principal</span>
    <button
      class="main-menu-close-btn"
      onclick={onClose}
      aria-label="Cerrar menu principal"
      title="Cerrar menu principal"
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
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  </div>
  <nav class="main-menu-nav" aria-label="Menu principal">
    <a class="main-menu-link" href="/" onclick={onClose}>Home</a>
    <a class="main-menu-link" href="/bim/viewer" onclick={onClose}>bim/viewer</a>
    <a class="main-menu-link" href="/biblia" onclick={onClose}>bible</a>

    {#if isAuthenticatedUserSession}
      <a class="main-menu-link" href="/profile" onclick={onClose}>Profile</a>
      <a class="main-menu-link" href="/dashboard" onclick={onClose}>Dashboard</a>
      <a class="main-menu-link" href="/payments" onclick={onClose}>Payments</a>
      <button class="main-menu-link main-menu-link-button" onclick={handleLogoutClick}>Logout</button>
    {:else}
      <a class="main-menu-link" href="/login" onclick={onClose}>Login</a>
    {/if}
  </nav>
</aside>

<style>
  .main-menu-overlay {
    position: fixed;
    inset: 0;
    z-index: 999;
    border: none;
    background: var(--glass-bg);
    cursor: pointer;
  }

  .main-menu-panel {
    position: fixed;
    top: 0;
    left: 0;
    width: 80vw;
    max-width: 100%;
    height: 100vh;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px 16px;
    background: var(--activity-bar-bg);
    border-right: 1px solid var(--border-clear);
    transform: translateX(-100%);
    transition: transform 0.2s ease;
  }

  .main-menu-panel-open {
    transform: translateX(0);
  }

  .main-menu-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .main-menu-title {
    color: var(--text-color);
    font-size: var(--font-size-6);
    line-height: var(--line-height-6);
  }

  .main-menu-close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    min-width: 30px;
    color: var(--btn-nav-color);
    background: var(--btn-hover-bg);
    border: 1px solid var(--border-clear);
    border-radius: var(--radius-1);
    cursor: pointer;
    transition:
      background 0.15s ease,
      color 0.15s ease,
      transform 0.15s ease;
  }

  .main-menu-close-btn:hover {
    background: var(--btn-hover-bg);
    color: var(--btn-nav-hover);
  }

  .main-menu-nav {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .main-menu-link {
    color: var(--text-color);
    text-decoration: none;
    padding: 10px 8px;
    border: 1px solid var(--border-clear);
    border-radius: var(--radius-1);
    background: var(--btn-bg);
  }

  .main-menu-link:hover {
    background: var(--btn-hover-bg);
    color: var(--btn-nav-hover);
  }

  .main-menu-link-button {
    text-align: left;
    width: 100%;
    color: var(--text-color);
    cursor: pointer;
  }

  @media (min-width: 769px) {
    .main-menu-panel {
      width: 35vh;
    }
  }
</style>
