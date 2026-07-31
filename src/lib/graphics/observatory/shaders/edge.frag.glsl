precision highp float;

uniform float uPulseDistance;
uniform float uPulseActive;
uniform float uTargetDistance;
uniform float uDestinationConstellationLead;
uniform float uSourceActivation;
uniform float uHeadWidth;
uniform float uTailWidth;
uniform float uSourceRadius;
uniform float uSourceConstellation;
uniform float uTargetConstellation;
uniform float uHeldSourceConstellation;
uniform float uHeldTargetConstellation;
uniform float uRetiringConstellation;
uniform float uRetireProgress;
uniform vec3 uInk;
uniform vec3 uSignalInk;
uniform float uBaseAlpha;
varying float vSide;
varying float vSignalDistance;
varying float vTargetDistance;
varying float vWeight;
varying float vDepth;
varying float vSegmentVisible;
varying float vConstellation;

float constellationMatch(float group, float constellation) {
  return step(0.0, constellation) * (
    1.0 - step(0.5, abs(group - constellation))
  );
}

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
    (1.0 - smoothstep(uSourceRadius * 1.4, uTailWidth, uPulseDistance)) *
    uSourceActivation;
  float sourceConstellation = constellationMatch(
    vConstellation,
    uSourceConstellation
  );
  float targetConstellation = constellationMatch(
    vConstellation,
    uTargetConstellation
  );
  float sourceConstellationReveal = smoothstep(
    vSignalDistance - 0.025,
    vSignalDistance + 0.14,
    uPulseDistance
  );
  float destinationPulse = max(
    0.0,
    uPulseDistance - (uTargetDistance - uDestinationConstellationLead)
  );
  float targetConstellationReveal = smoothstep(
    vTargetDistance - 0.025,
    vTargetDistance + 0.14,
    destinationPulse
  );
  float constellationActivation =
    max(
      sourceConstellation * sourceConstellationReveal,
      targetConstellation * targetConstellationReveal
    ) * 0.58;
  float transientActivation =
    max(head, max(wake, max(source, constellationActivation))) * uPulseActive;
  float retiringConstellation = constellationMatch(
    vConstellation,
    uRetiringConstellation
  );
  const float heldIntensity = 0.72;
  float heldActivation = max(
    constellationMatch(vConstellation, uHeldSourceConstellation),
    constellationMatch(vConstellation, uHeldTargetConstellation)
  ) * (1.0 - retiringConstellation * uRetireProgress) * heldIntensity;
  float retiringActivation =
    retiringConstellation *
    (1.0 - uRetireProgress) *
    heldIntensity;
  float activation = max(
    transientActivation,
    max(heldActivation, retiringActivation)
  );
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

  if (vSegmentVisible < 0.5 || alpha < 0.002) discard;
  gl_FragColor = vec4(ink, alpha);
  #include <colorspace_fragment>
}
