<script lang="ts">
  import tinyImage from "$lib/assets/personal_photo_cropped_20x33.webp";
  import highResImage from "$lib/assets/personal_photo_cropped_1080x1920.webp";

  let isLoaded = $state(false);
  
  // 1. Create a reference to the actual HTML element
  let highResElement: HTMLImageElement | undefined = $state();

  // 2. When the component mounts, check if the image is already fully complete (cached)
  $effect(() => {
    if (highResElement && highResElement.complete) {
      isLoaded = true;
    }
  });
</script>

<div class="background-wrapper">
  <img
    src={tinyImage}
    alt="background blur"
    class="bg-image blur"
    class:visible={!isLoaded}
  />

  <img
    bind:this={highResElement}  src={highResImage}
    alt="background high res"
    class="bg-image"
    class:visible={isLoaded}
    onload={() => (isLoaded = true)}
  />
</div>

<style>
.background-wrapper {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100svh;
        z-index: -1; 
        overflow: hidden;
    }

    .bg-image {
        position: absolute; 
        top: 0;
        left: 20%;
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


    /* ΤΑΒLET */
    /**/
    /**/
    /**/
    /**/
    @media (max-width: 1024px) {
        .bg-image {
            /* Example: Center the image and remove the 20px offset for smaller screens */
            left: 0; 
            width: 100%;
            object-fit: cover; 
            object-position: center center;
        }
    }

    /* MOBILE */
    /**/
    /**/
    /**/
    /**/
    @media (max-width: 768px) {
      .bg-image {
            object-position: 70% 0%;
            height:150%;
            top: -5%;
        }
    }
</style>
