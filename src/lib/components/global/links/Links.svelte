<script lang="ts">
  import GlobalMenuLink from "./GlobalMenuLink.svelte";


</script>

<!-- MARKUP -->
<!-- -->
<!-- -->
<!-- -->

<ul>
   <GlobalMenuLink route="/" routeName="Home" />
   <GlobalMenuLink route="/login" routeName="Login" />
   <GlobalMenuLink route="/register" routeName="Register" />
   <GlobalMenuLink route="/aibunker" routeName="AI Bunker" />
</ul>

<!-- STYLES -->
<!-- -->
<!-- -->
<!-- -->

<style>
ul{
   border: solid 1px red;
}
</style>
