precision highp float;

attribute float aMagnitude;
attribute float aDistance;
attribute float aTargetDistance;
attribute float aLocator;
attribute float aConstellation;
uniform float uAspect;
uniform float uMapScale;
uniform float uPixelRatio;
uniform float uPulseDistance;
uniform float uPulseActive;
uniform float uTargetDistance;
uniform float uDestinationConstellationLead;
uniform float uSourceActivation;
uniform float uHeadWidth;
uniform float uSourceRadius;
uniform float uSurveyMode;
uniform float uSourceConstellation;
uniform float uTargetConstellation;
uniform float uHeldSourceConstellation;
uniform float uHeldTargetConstellation;
uniform float uRetiringConstellation;
uniform float uRetireProgress;
uniform vec3 uRight;
uniform vec3 uUp;
uniform vec3 uForward;
varying float vActivation;
varying float vBrightness;
varying float vDepth;
varying float vLocator;
varying float vStarRadius;

/* @include projection */

float constellationMatch(float group, float constellation) {
  return step(0.0, constellation) * (
    1.0 - step(0.5, abs(group - constellation))
  );
}

void main() {
  float depth;
  vec2 point = projectSky(position, depth);
  float head = 1.0 - smoothstep(
    uHeadWidth * 0.25,
    uHeadWidth,
    abs(uPulseDistance - aDistance)
  );
  float source = 1.0 - smoothstep(0.0, uSourceRadius, aDistance);
  float brightnessBase = clamp((6.25 - aMagnitude) / 7.75, 0.015, 1.0);
  vBrightness = pow(brightnessBase, 1.28);
  float waveActivation =
    head *
    (1.0 - source) *
    uPulseActive *
    mix(1.0, 0.14, uSurveyMode);
  float sourceConstellation = constellationMatch(
    aConstellation,
    uSourceConstellation
  );
  float targetConstellation = constellationMatch(
    aConstellation,
    uTargetConstellation
  );
  float sourceConstellationReveal = smoothstep(
    aDistance - 0.025,
    aDistance + 0.14,
    uPulseDistance
  );
  float destinationPulse = max(
    0.0,
    uPulseDistance - (uTargetDistance - uDestinationConstellationLead)
  );
  float targetConstellationReveal = smoothstep(
    aTargetDistance - 0.025,
    aTargetDistance + 0.14,
    destinationPulse
  );
  float constellationActivation =
    max(
      sourceConstellation * sourceConstellationReveal,
      targetConstellation * targetConstellationReveal
    ) *
    uPulseActive *
    mix(0.58, 0.24, uSurveyMode);
  float retiringConstellation = constellationMatch(
    aConstellation,
    uRetiringConstellation
  );
  float heldIntensity = mix(0.72, 0.42, uSurveyMode);
  float heldActivation = max(
    constellationMatch(aConstellation, uHeldSourceConstellation),
    constellationMatch(aConstellation, uHeldTargetConstellation)
  ) * (1.0 - retiringConstellation * uRetireProgress) * heldIntensity;
  float retiringActivation =
    retiringConstellation *
    (1.0 - uRetireProgress) *
    heldIntensity;
  vActivation = max(
    max(
      max(waveActivation, source * uSourceActivation),
      constellationActivation
    ),
    max(heldActivation, retiringActivation)
  );
  vDepth = depth;
  vLocator = aLocator;
  gl_Position = vec4(point.x * 2.0 - 1.0, 1.0 - point.y * 2.0, 0.0, 1.0);
  float nightPointSize =
    (0.82 + vBrightness * 3.4 + vActivation * 2.15) *
    uPixelRatio *
    mix(0.82, 1.0, depth);
  float surveyPointSize =
    (1.35 + vBrightness * 4.4 + vActivation * 2.15) *
    uPixelRatio *
    mix(0.86, 1.0, depth);
  float basePointSize = mix(nightPointSize, surveyPointSize, uSurveyMode);
  gl_PointSize = max(basePointSize, aLocator * 38.0 * uPixelRatio);
  vStarRadius = 0.72 * basePointSize / gl_PointSize;
}
