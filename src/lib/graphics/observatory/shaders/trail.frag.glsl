precision highp float;

uniform vec3 uInk;
uniform float uSurveyMode;
uniform float uTrailOpacity;
varying float vAlong;
varying float vStrength;
varying float vMotion;
varying float vSide;
varying float vVisible;

void main() {
  float antialias = max(fwidth(vSide) * 1.15, 0.018);
  float coverage = 1.0 - smoothstep(
    0.42 - antialias,
    0.42 + antialias,
    abs(vSide)
  );
  float tailGradient = mix(0.08, 1.0, smoothstep(0.0, 1.0, vAlong));
  float themeStrength = mix(0.9, 0.68, uSurveyMode);
  float alpha =
    coverage *
    tailGradient *
    vStrength *
    vMotion *
    vVisible *
    uTrailOpacity *
    themeStrength;

  if (alpha < 0.002) discard;
  gl_FragColor = vec4(uInk, alpha);
  #include <colorspace_fragment>
}
