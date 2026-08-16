precision highp float;

uniform float uTrailAlpha;
uniform float uReflection;
varying float vAlong;
varying float vDiffusion;
varying float vFieldFade;
varying float vGalacticDensity;
varying float vReflectionDepth;
varying float vStrength;
varying float vMotion;
varying float vSide;
varying vec3 vTint;

void main() {
  float antialias = max(fwidth(vSide) * 1.15, 0.018);
  float core = 1.0 - smoothstep(
    0.42 - antialias,
    0.42 + antialias,
    abs(vSide)
  );
  float halo = 1.0 - smoothstep(0.42, 0.94, abs(vSide));
  float coverage = core + halo * vDiffusion * 0.3;
  float tail_gradient = mix(0.08, 1.0, smoothstep(0.0, 1.0, vAlong));
  float galactic_gain = mix(0.56, 1.34, vGalacticDensity);
  float reflected_light = 0.76 + exp(-vReflectionDepth * 9.0) * 0.34;
  float surface_light = mix(1.0, reflected_light, uReflection);
  float alpha =
    coverage *
    tail_gradient *
    (0.32 + vStrength * 1.55) *
    vMotion *
    uTrailAlpha *
    vFieldFade *
    surface_light *
    galactic_gain;

  if (alpha < 0.002) discard;
  gl_FragColor = vec4(vTint, alpha);
  #include <colorspace_fragment>
}
