precision highp float;

uniform vec3 uInk;
uniform vec3 uSignalInk;
uniform float uBaseAlpha;
uniform float uSurveyMode;
uniform float uLocatorProgress;
uniform float uLocatorScale;
varying float vActivation;
varying float vBrightness;
varying float vDepth;
varying float vLocator;
varying float vStarRadius;

void main() {
  vec2 markerCoordinate = gl_PointCoord - 0.5;
  float radius = length(markerCoordinate) * 2.0;
  float antialias = max(fwidth(radius) * 1.15, 0.04);
  float solidCoverage = 1.0 - smoothstep(
    vStarRadius - antialias,
    vStarRadius + antialias,
    radius
  );
  float surveyRingRadius = mix(
    0.3,
    0.7,
    smoothstep(0.18, 0.86, vBrightness)
  );
  float surveyRing = 1.0 - smoothstep(
    antialias * 0.7,
    antialias * 1.45,
    abs(radius - surveyRingRadius)
  );
  float surveyRingWeight = smoothstep(0.24, 0.68, vBrightness);
  float surveyCoverage = mix(solidCoverage, surveyRing, surveyRingWeight);
  surveyCoverage = mix(
    surveyCoverage,
    solidCoverage,
    smoothstep(0.12, 0.4, vActivation)
  );
  float coverage = mix(solidCoverage, surveyCoverage, uSurveyMode);
  float depthTone = mix(0.62, 1.0, vDepth);
  float baseIntensity = uBaseAlpha * 0.72 + vBrightness * 0.88;
  float signalIntensity = vActivation * 0.82;
  float locatorIntensity = 0.0;
  if (vLocator > 0.5) {
    float angle = fract(
      0.25 - atan(markerCoordinate.y, markerCoordinate.x) / 6.28318530718
    );
    float trace = 1.0 - smoothstep(
      uLocatorProgress,
      uLocatorProgress + 0.045,
      angle
    );
    float dash = 1.0 - smoothstep(
      0.28,
      0.34,
      abs(fract(angle * 12.0 + 0.5) - 0.5)
    );
    float ringDistance = abs(radius - 0.7 * uLocatorScale);
    float ring = 1.0 - smoothstep(
      antialias * 0.65,
      antialias * 1.8,
      ringDistance
    );
    float locatorVisibility = smoothstep(0.08, 0.18, uLocatorScale);
    locatorIntensity = ring * dash * trace * locatorVisibility * 0.52;
  }
  float starIntensity = (baseIntensity + signalIntensity) * coverage;
  float combinedIntensity = starIntensity + locatorIntensity;
  float alpha = combinedIntensity * depthTone;
  vec3 ink = mix(
    uInk,
    uSignalInk,
    signalIntensity * coverage / max(combinedIntensity, 0.001)
  );

  if (alpha < 0.002) discard;
  gl_FragColor = vec4(ink, alpha);
  #include <colorspace_fragment>
}
