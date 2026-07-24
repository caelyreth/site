<!-- Station-wide fixed chrome, kept separate from route content. -->
<div aria-hidden="true" class="hatch"></div>
<div aria-hidden="true" class="guide guide-left chrome-fade"></div>
<div aria-hidden="true" class="guide guide-right chrome-fade"></div>
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
