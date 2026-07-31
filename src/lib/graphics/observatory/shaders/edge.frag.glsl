precision highp float;

uniform float uPulseDistance;
uniform float uPulseActive;
uniform float uHeadWidth;
uniform float uTailWidth;
uniform float uSourceRadius;
uniform vec3 uInk;
uniform vec3 uSignalInk;
uniform float uBaseAlpha;
varying float vSide;
varying float vSignalDistance;
varying float vWeight;
varying float vDepth;

void main() {
  float antialias = max(fwidth(vSide) * 1.18, 0.012);
  float coverage = 1.0 - smoothstep(0.34 - antialias, 0.34 + antialias, abs(vSide));
  float behind = uPulseDistance - vSignalDistance;
  float head = 1.0 - smoothstep(uHeadWidth * 0.2, uHeadWidth, abs(behind));
  float wake =
    smoothstep(0.0, uHeadWidth * 0.34, behind) *
    (1.0 - smoothstep(uHeadWidth, uTailWidth, behind)) *
    0.32;
  float source =
    (1.0 - smoothstep(0.0, uSourceRadius, vSignalDistance)) *
    (1.0 - smoothstep(uSourceRadius * 1.4, uTailWidth, uPulseDistance));
  float activation = max(head, max(wake, source)) * uPulseActive;
  float depthTone = mix(0.68, 1.0, vDepth);
  float baseIntensity = uBaseAlpha * vWeight;
  float signalIntensity = activation * 0.84;
  float combinedIntensity = baseIntensity + signalIntensity;
  float alpha = combinedIntensity * coverage * depthTone;
  vec3 ink = mix(
    uInk,
    uSignalInk,
    signalIntensity / max(combinedIntensity, 0.001)
  );

  if (alpha < 0.002) discard;
  gl_FragColor = vec4(ink, alpha);
  #include <colorspace_fragment>
}
