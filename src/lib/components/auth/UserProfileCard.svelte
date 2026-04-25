<script lang="ts">
  import { goto } from "$app/navigation";
  import { authStore } from "$lib/stores/auth";

  const currentUser = $derived(authStore.getCurrentUser());

  const logoutAuthenticatedUserSession = async (): Promise<void> => {
    authStore.logout();
    await goto("/login");
  };
</script>

<section class="user-profile-card">
  <h1 class="user-profile-title">Profile</h1>

  {#if currentUser}
    <dl class="user-profile-data-list">
      <div class="user-profile-data-row">
        <dt>User ID</dt>
        <dd>{currentUser.id}</dd>
      </div>
      <div class="user-profile-data-row">
        <dt>Username</dt>
        <dd>{currentUser.username}</dd>
      </div>
    </dl>
  {/if}

  <button class="user-profile-logout-button" onclick={logoutAuthenticatedUserSession}>Logout</button>
</section>

<style>
  .user-profile-card {
    max-width: 36rem;
    margin: 0 auto;
    padding: 1rem;
    border: 1px solid var(--border-clear);
    border-radius: var(--radius-1);
    background: var(--accordion-bg);
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  .user-profile-title {
    color: var(--text-main);
    font-size: var(--font-size-7);
    line-height: var(--line-height-7);
  }

  .user-profile-data-list {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .user-profile-data-row {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .user-profile-data-row dt {
    color: var(--text-muted);
    font-size: var(--font-size-4);
    line-height: var(--line-height-4);
  }

  .user-profile-data-row dd {
    color: var(--text-main);
    font-size: var(--font-size-5);
    line-height: var(--line-height-5);
    margin: 0;
  }

  .user-profile-logout-button {
    width: 100%;
    border: 1px solid var(--border-clear);
    background: var(--btn-hover-bg);
    color: var(--text-main);
  }
</style>
