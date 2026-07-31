precision highp float;

uniform float uPulseDistance;
uniform float uPulseActive;
uniform vec3 uSignalInk;
varying float vSide;
varying float vDistance;
varying float vDepth;

void main() {
  float antialias = max(fwidth(vSide) * 1.18, 0.012);
  float coverage = 1.0 - smoothstep(
    0.32 - antialias,
    0.32 + antialias,
    abs(vSide)
  );
  float revealed = 1.0 - smoothstep(
    uPulseDistance + 0.008,
    uPulseDistance + 0.05,
    vDistance
  );
  float head = 1.0 - smoothstep(
    0.024,
    0.16,
    abs(uPulseDistance - vDistance)
  );
  float alpha =
    revealed * (0.44 + head * 0.46) * uPulseActive * coverage *
    mix(0.7, 1.0, vDepth);

  if (alpha < 0.002) discard;
  gl_FragColor = vec4(uSignalInk, alpha);
  #include <colorspace_fragment>
}
