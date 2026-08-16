precision highp float;

uniform float uTrailAlpha;
varying float vAlong;
varying float vStrength;
varying float vMotion;
varying float vSide;
varying vec3 vTint;

void main() {
  float antialias = max(fwidth(vSide) * 1.15, 0.018);
  float coverage = 1.0 - smoothstep(
    0.42 - antialias,
    0.42 + antialias,
    abs(vSide)
  );
  float tail_gradient = mix(0.08, 1.0, smoothstep(0.0, 1.0, vAlong));
  float alpha =
    coverage *
    tail_gradient *
    (0.32 + vStrength * 1.55) *
    vMotion *
    uTrailAlpha;

  if (alpha < 0.002) discard;
  gl_FragColor = vec4(vTint, alpha);
  #include <colorspace_fragment>
}
