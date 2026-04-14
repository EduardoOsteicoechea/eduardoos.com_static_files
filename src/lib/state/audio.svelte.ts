export const audioState = $state({
  paused: true,
  element: null as HTMLAudioElement | null
});

export function toggleAudio() {
  if (!audioState.element) return;
  if (audioState.paused) {
    audioState.element.play();
  } else {
    audioState.element.pause();
  }
}
