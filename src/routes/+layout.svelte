<script lang="ts">
  import favicon from "$lib/assets/favicon.svg";
  import PersonalPhoto from "$lib/components/global/background/PersonalPhoto.svelte";
  import Chat from "$lib/components/global/chat/Chat.svelte";
  import Controls from "$lib/components/global/controls/Controls.svelte";
  import Links from "$lib/components/global/links/Links.svelte";
  import Modal from "$lib/components/global/modal/Modal.svelte";
  import Payment from "$lib/components/global/payment/Payment.svelte";
//   import "../app.css";
//   import "../theme.css";

  let { children } = $props();
</script>

<!-- MARKUP -->
<!-- -->
<!-- -->
<!-- -->

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>BIM Software for Cloud, Web and Desktop</title>
</svelte:head>

<PersonalPhoto />

<main class="page-content">
  {@render children()}
</main>

<!-- <Links />
<Chat />
<Controls />
<Modal />
<Payment /> -->

<!-- STYLES -->
<!-- -->
<!-- -->
<!-- -->

<style>
  :global(body) {
    margin: 0;
  }

  .page-content {
    position: relative;
    z-index: 1;
  }

  :global(:root){
   font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }

  :global(*){
   padding: 0;
   margin: 0;
   position: relative;
   box-sizing: border-box;
  }
</style>
