precision highp float;

uniform vec3 uInk;
uniform vec3 uSignalInk;
uniform float uBaseAlpha;
varying float vActivation;
varying float vBrightness;
varying float vDepth;

void main() {
  float radius = length(gl_PointCoord - 0.5) * 2.0;
  float antialias = max(fwidth(radius) * 1.15, 0.04);
  float coverage = 1.0 - smoothstep(0.72 - antialias, 0.72 + antialias, radius);
  float depthTone = mix(0.62, 1.0, vDepth);
  float baseIntensity = uBaseAlpha * 0.72 + vBrightness * 0.88;
  float signalIntensity = vActivation * 0.82;
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
