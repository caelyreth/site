<script lang="ts">
  import StationBoundary from '$lib/station-boundary.svelte'
</script>

<!-- Station-wide fixed chrome, kept separate from route content. -->
<div aria-hidden="true" class="hatch"></div>
<StationBoundary side="left" />
<StationBoundary side="right" />
<div aria-hidden="true" class="vignette"></div>
<div aria-hidden="true" class="bolt chrome-fade" top-4 left-4></div>
<div aria-hidden="true" class="bolt chrome-fade" top-4 right-4></div>
<div aria-hidden="true" class="bolt chrome-fade" bottom-4 left-4></div>
<div aria-hidden="true" class="bolt chrome-fade" bottom-4 right-4></div>
<svg
  aria-hidden="true"
  class="chrome-fade"
  fixed
  top-5
  left-9
  z-30
  width="12"
  height="14"
  viewBox="0 0 12 14"
  fill="none"
>
  <path d="M6 2v12" stroke="var(--color-rule)" />
  <path d="M2.5 6.5 6 2l3.5 4.5" stroke="var(--color-rule)" fill="none" />
</svg>

<!-- Faint construction figures appear only where the hatch field has room. -->
<div
  aria-hidden="true"
  fixed
  top-20vh
  pointer-events-none
  class="chrome-fade -right-24 hidden lg:block"
>
  <svg width="440" height="320" viewBox="0 0 340 220" fill="none">
    <path d="M120 0v220" stroke="var(--color-deco)" stroke-dasharray="4 4" />
    <path d="M60 170 180 50" stroke="var(--color-deco)" stroke-dasharray="4 4" />
    <circle cx="120" cy="110" r="85" stroke="var(--color-deco)" />
    <rect x="60" y="50" width="120" height="120" stroke="var(--color-deco)" />
  </svg>
</div>
<div
  aria-hidden="true"
  fixed
  bottom-15vh
  pointer-events-none
  class="chrome-fade -left-20 hidden lg:block"
>
  <svg width="340" height="300" viewBox="0 0 200 200" fill="none">
    <circle cx="100" cy="100" r="28" stroke="var(--color-deco)" />
    <circle cx="100" cy="100" r="52" stroke="var(--color-deco)" stroke-dasharray="4 4" />
    <circle cx="100" cy="100" r="76" stroke="var(--color-deco)" stroke-dasharray="4 4" />
    <circle cx="100" cy="100" r="1.5" fill="var(--color-deco)" />
  </svg>
</div>

<style>
/* the field — hatch stripes, strong static noise, concrete mottle;
   everything outside the card lives here */
.hatch {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image:
    repeating-linear-gradient(
      -55deg,
      transparent 0 7px,
      var(--color-hatch) 7px 8px
    ),
    var(--noise-tile),
    url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='m'><feTurbulence type='fractalNoise' baseFrequency='0.012' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0.6 0'/></filter><rect width='100%25' height='100%25' filter='url(%23m");
  background-size: auto, 128px, 320px;
}


/* panel bolt — concrete panels joined at the viewport corners */
.bolt {
  position: fixed;
  width: 9px;
  height: 9px;
  pointer-events: none;
  z-index: 30;
  border: 1px solid var(--color-rule);
  border-radius: 50%;
}
.bolt::after {
  content: '';
  position: absolute;
  inset: 3px;
  background: var(--color-rule);
  border-radius: 50%;
}

/* liminal vignette — the lit center holds the eye */
.vignette {
  position: fixed;
  inset: 0;
  z-index: 38;
  pointer-events: none;
  background: radial-gradient(
    120% 90% at 50% 40%,
    transparent 60%,
    color-mix(in oklab, var(--color-ink) 7%, transparent) 100%
  );
}

/* station chrome that assembles as you descend (p: 0 -> 1) */
.chrome-fade {
  opacity: var(--p, 0);
}
</style>
