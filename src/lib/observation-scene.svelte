<script lang="ts">
  import ObservationWindow from '$lib/observation-window.svelte'
  import SceneDebris from '$lib/scene-debris.svelte'

  const observations = [
    {
      src: '/observation_1.jpg',
      alt: 'Pale blue and white vertical impasto painting',
    },
    {
      src: '/observation_2.jpg',
      alt: 'Deep blue abstract painting with cloud-like bands',
    },
    {
      src: '/observation_3.jpg',
      alt: 'Black and white gestural brushwork painting',
    },
    {
      src: '/observation_4.jpg',
      alt: 'Layered teal, black, and ochre abstract painting',
    },
  ]
</script>

<div class="capture">
  <section class="scene full-bleed" flex="~ items-center justify-center">
    <SceneDebris />

    <span class="scene-label scene-corner scene-corner-left" absolute top-20>
      Caelyreth — observation window
    </span>
    <span class="scene-label scene-corner scene-corner-right" absolute top-20>
      Field 044° 12′
    </span>
    <span class="scene-label scene-corner scene-corner-left" absolute bottom-5>
      Transmission 001
    </span>
    <a
      href="#station"
      class="scene-label scene-corner scene-corner-right"
      absolute
      bottom-5
    >
      Descend to the station ↓
    </a>

    <ObservationWindow {observations} />
  </section>
</div>
