precision highp float;

attribute vec2 aSeed;
attribute float aDepth;
attribute float aOrbitOffset;
attribute float aStrength;
attribute vec3 aTint;
attribute float aWidthFactor;
uniform vec2 uResolution;
uniform float uHalfWidth;
uniform float uTrailOrbitAngle;
uniform float uGroundHorizon;
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

/* @include projection */

vec2 fieldPoint() {
  return mix(
    vec2(-0.08, -0.06),
    vec2(1.3, 1.18),
    aSeed
  );
}

vec2 trailPoint(float angle) {
  vec2 field_point = fieldPoint();
  return orbitFieldPoint(warpFieldPoint(field_point, aDepth), angle);
}

float galacticDensity(vec2 point) {
  vec2 offset = point - vec2(0.52, 0.56);
  float ridge = offset.y + offset.x * 0.42 - offset.x * offset.x * 0.18;
  float band = 1.0 - smoothstep(0.085, 0.35, abs(ridge));
  return pow(band, 1.35);
}

vec2 projectTrailPoint(vec2 point) {
  if (uReflection < 0.5) return point;

  return vec2(point.x, 2.0 * uGroundHorizon - point.y);
}

float skyFade(vec2 point) {
  return 1.0 - smoothstep(
    uGroundHorizon - 0.047,
    uGroundHorizon - 0.006,
    point.y
  );
}

float groundFade(vec2 point) {
  float source_depth = uGroundHorizon - point.y;
  return skyFade(point) * (1.0 - smoothstep(0.3, 0.68, source_depth));
}

float skyTonalTaper(vec2 point) {
  if (uReflection > 0.5) return 1.0;

  float right_side = smoothstep(0.52, 1.02, point.x);
  float horizon_band = 1.0 - smoothstep(
    0.14,
    0.5,
    abs(point.y - uGroundHorizon)
  );
  return 1.0 - right_side * horizon_band * 0.16;
}

void main() {
  float tail_angle = uTrailOrbitAngle + aOrbitOffset;
  float head_angle = uOrbitAngle + aOrbitOffset;
  vec2 current_point = projectTrailPoint(trailPoint(head_angle));
  vec2 previous_point = projectTrailPoint(trailPoint(tail_angle));
  vec2 motion_pixels = (current_point - previous_point) * uResolution;
  float motion_length = length(motion_pixels);
  float angle = mix(tail_angle, head_angle, position.x);
  vec2 source_point = trailPoint(angle);
  vec2 point = projectTrailPoint(source_point);
  const float tangent_step = 0.025;
  vec2 before = projectTrailPoint(
    trailPoint(mix(tail_angle, head_angle, max(0.0, position.x - tangent_step)))
  );
  vec2 after = projectTrailPoint(
    trailPoint(mix(tail_angle, head_angle, min(1.0, position.x + tangent_step)))
  );
  vec2 direction = (after - before) * uResolution;
  direction /= max(length(direction), 0.0001);
  vec2 normal = vec2(-direction.y, direction.x);
  vec2 clip = vec2(point.x * 2.0 - 1.0, 1.0 - point.y * 2.0);
  float half_width =
    uHalfWidth *
    mix(0.5, 1.02, aWidthFactor) *
    mix(0.82, 1.0, aDepth) *
    mix(0.18, 1.0, position.x);
  vec2 normal_clip =
    vec2(normal.x, -normal.y) * (2.0 * half_width / uResolution);

  clip += normal_clip * position.y;
  vAlong = position.x;
  vGalacticDensity = galacticDensity(fieldPoint());
  vDiffusion = mix(
    mix(0.1, 0.28, aDepth),
    mix(0.46, 0.7, aDepth),
    uReflection
  );
  vFieldFade =
    mix(skyFade(source_point), groundFade(source_point), uReflection) *
    skyTonalTaper(source_point);
  vReflectionDepth = max(0.0, uGroundHorizon - source_point.y);
  vStrength = aStrength;
  vMotion = smoothstep(0.35, 2.2, motion_length);
  vSide = position.y;
  vTint = aTint;
  gl_Position = vec4(clip, 0.0, 1.0);
}
