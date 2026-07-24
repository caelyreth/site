<script lang="ts">
  import IsoCube from '$lib/iso-cube.svelte'
</script>

<div class="scene-debris">
  <div aria-hidden="true" class="stars stars-far"></div>
  <div aria-hidden="true" class="stars"></div>

  <!-- A wide field diagram uses layered contour curves, keeping the
       observation expressive without becoming decorative. -->
  <svg
    aria-hidden="true"
    class="scene-growth scene-growth-back"
    viewBox="0 0 1600 900"
    preserveAspectRatio="none"
    fill="none"
  >
    <g stroke="currentColor" vector-effect="non-scaling-stroke">
      <path
        class="scene-growth-strong"
        d="M-120 778C154 585 411 705 667 539S1094 268 1720 176"
      />
      <path
        class="scene-growth-strong"
        d="M-76 204C246 307 398 164 617 236s410 88 1059-110"
      />
      <path
        class="scene-growth-curve"
        d="M-96 478C185 368 370 524 622 425s443-236 1099-150"
      />
      <path
        class="scene-growth-curve"
        d="M-42 855C255 719 416 829 686 710s463-99 973-342"
      />
      <path
        class="scene-growth-curve scene-growth-curve-soft"
        d="M178-35C380 104 512 64 697 164s385 156 756 36"
      />
      <circle class="scene-growth-node" cx="667" cy="539" r="10" />
      <circle class="scene-growth-node" cx="1113" cy="276" r="8" />
      <circle class="scene-growth-node" cx="617" cy="236" r="6" />
      <circle class="scene-growth-node" cx="1126" cy="561" r="5" />
    </g>
  </svg>

  <span
    class="scene-label v-text hidden sm:block"
    absolute
    right-3
    style="top: 50%"
  >
    Rainbook program
  </span>
  <span
    class="scene-label v-text-left hidden sm:block"
    absolute
    left-3
    style="top: 50%"
  >
    Kept by Yu
  </span>

  <div absolute w-20 class="scene-solid hidden -rotate-8 sm:block" style="top: 5%; left: 22%">
    <IsoCube />
  </div>
  <div absolute w-12 class="scene-solid hidden rotate-10 sm:block" style="top: 12%; right: 22%">
    <IsoCube />
  </div>
  <div absolute w-9 class="scene-solid hidden -scale-x-100 sm:block" style="top: 60%; left: 16%">
    <IsoCube />
  </div>
  <div
    absolute
    w-8
    class="scene-solid hidden rotate-6 blur-[1.5px] sm:block"
    style="bottom: 8%; right: 24%"
  >
    <IsoCube />
  </div>
  <div
    absolute
    w-20
    class="scene-solid hidden rotate-3 blur-[2.5px] md:block"
    style="bottom: 10%; left: 62%"
  >
    <IsoCube />
  </div>

  <div absolute w-20 class="hidden -rotate-12 sm:block" style="top: 38%; right: 5%">
    <IsoCube wire />
  </div>
  <div absolute w-10 class="hidden rotate-6 sm:block" style="top: 26%; left: 3%">
    <IsoCube wire />
  </div>
  <div absolute w-8 class="hidden -rotate-4 md:block" style="bottom: 6%; left: 38%">
    <IsoCube wire />
  </div>

  <div
    aria-hidden="true"
    class="orbit hidden sm:block"
    absolute
    size-36
    style="bottom: 16%; left: 8%"
  ></div>
  <div
    aria-hidden="true"
    class="orbit hidden md:block"
    absolute
    size-20
    style="top: 24%; right: 30%"
  ></div>

  <div
    aria-hidden="true"
    class="pixels hidden md:block"
    absolute
    style="top: 10%; left: 14%"
  ></div>
  <div
    aria-hidden="true"
    class="pixels hidden sm:block"
    absolute
    style="bottom: 12%; left: 9%"
  ></div>
  <div
    aria-hidden="true"
    class="pixels hidden md:block"
    absolute
    style="top: 18%; right: 7%"
  ></div>
  <span aria-hidden="true" class="marker" absolute style="top: 28%; left: 28%"></span>
  <span
    aria-hidden="true"
    class="marker hidden sm:block"
    absolute
    style="top: 34%; right: 20%"
  ></span>
  <span
    aria-hidden="true"
    class="marker hidden md:block"
    absolute
    style="bottom: 30%; right: 26%"
  ></span>
  <span
    aria-hidden="true"
    class="marker hidden sm:block"
    absolute
    style="top: 47%; right: 18%; background: var(--color-accent)"
  ></span>

  <div
    aria-hidden="true"
    class="streaks hidden sm:block"
    absolute
    style="left: 5%; top: 64%"
  ></div>
  <div
    aria-hidden="true"
    class="stripe-block hidden sm:block"
    absolute
    style="right: 14%; bottom: 24%"
  ></div>
  <div
    aria-hidden="true"
    class="stripe-block sm hidden md:block"
    absolute
    style="left: 7%; top: 42%"
  ></div>
</div>
