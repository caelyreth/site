<script lang="ts">
  import ObservationWindow from '$lib/observation-window.svelte'
  import SceneDebris from '$lib/scene-debris.svelte'

  const observations = [
    {
      src: '/observation_1.webp',
      alt: 'Pale blue and white vertical impasto painting',
    },
    {
      src: '/observation_2.webp',
      alt: 'Deep blue abstract painting with cloud-like bands',
    },
    {
      src: '/observation_3.webp',
      alt: 'Black and white gestural brushwork painting',
    },
    {
      src: '/observation_4.webp',
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

    <!-- Registration traces sit behind the observation window, placing the
         studies cleanly above the wider field. -->
    <svg
      aria-hidden="true"
      class="scene-growth-foreground"
      viewBox="0 0 1600 900"
      preserveAspectRatio="none"
      fill="none"
    >
      <g stroke="currentColor" vector-effect="non-scaling-stroke">
        <path
          class="scene-growth-trace"
          d="M-44 677C287 544 480 645 748 500s454-72 896-278"
        />
        <path
          class="scene-growth-trace scene-growth-trace-fine"
          d="M-68 272C226 151 450 316 721 232s454 18 948-202"
        />
        <path
          class="scene-growth-trace scene-growth-trace-fine"
          d="M945 842c144-129 297-82 425-161s187-171 302-206"
        />
        <circle class="scene-growth-front-node" cx="748" cy="500" r="6" />
        <circle class="scene-growth-front-node" cx="1261" cy="351" r="4" />
      </g>
    </svg>
  </section>
</div>
