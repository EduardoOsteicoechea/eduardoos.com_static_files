<script lang="ts">
    import favicon from '$lib/assets/favicon.svg';
    import tinyImage from '$lib/assets/personal_photo_cropped_20x33.webp';
    import highResImage from '$lib/assets/personal_photo_cropped_1080x1920.webp';

    let { children } = $props();
    let isLoaded = $state(false);
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
    <title>BIM Software for Cloud, Web and Desktop</title>
</svelte:head>

<div class="background-wrapper">
    <img 
        src={tinyImage} 
        alt="background blur" 
        class="bg-image blur" 
        class:visible={!isLoaded}
    />
    
    <img 
        src={highResImage} 
        alt="background high res" 
        class="bg-image" 
        class:visible={isLoaded}
        onload={() => isLoaded = true} 
    />
</div>

<main class="page-content">
    {@render children()}
</main>

<style>
    :global(body) {
        margin: 0;
    }

    .background-wrapper {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: -1; 
        overflow: hidden;
    }

    .bg-image {
        position: absolute; 
        top: 0;
        left: 20px;
        height:100%;
        opacity: 0;
        transition: opacity 2s ease-in-out;
    }

    .bg-image.visible {
        opacity: 1;
    }

    .blur {
        filter: blur(20px);
    }

    .page-content {
        position: relative;
        z-index: 1; 
    }

    @media (max-width: 1024px) {
        .bg-image {
            /* Example: Center the image and remove the 20px offset for smaller screens */
            left: 0; 
            width: 100%;
            object-fit: cover; 
            object-position: center center;
        }
    }

    /* MOBILE CONDITION (Screens smaller than 768px wide) */
    @media (max-width: 768px) {
      .bg-image {
            object-position: 70% 0%;
            height:150%;
            top: -5%;
        }
    }
</style>