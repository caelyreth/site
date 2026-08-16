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
varying float vAlong;
varying float vStrength;
varying float vMotion;
varying float vSide;
varying vec3 vTint;

/* @include projection */

vec2 trailPoint(float angle) {
  vec2 field_point = mix(
    vec2(-0.08, -0.06),
    vec2(1.3, 1.18),
    aSeed
  );
  return orbitFieldPoint(warpFieldPoint(field_point, aDepth), angle);
}

void main() {
  float tail_angle = uTrailOrbitAngle + aOrbitOffset;
  float head_angle = uOrbitAngle + aOrbitOffset;
  vec2 current_point = trailPoint(head_angle);
  vec2 previous_point = trailPoint(tail_angle);
  vec2 motion_pixels = (current_point - previous_point) * uResolution;
  float motion_length = length(motion_pixels);
  float angle = mix(tail_angle, head_angle, position.x);
  vec2 point = trailPoint(angle);
  const float tangent_step = 0.025;
  vec2 before = trailPoint(
    mix(tail_angle, head_angle, max(0.0, position.x - tangent_step))
  );
  vec2 after = trailPoint(
    mix(tail_angle, head_angle, min(1.0, position.x + tangent_step))
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
  vStrength = aStrength;
  vMotion = smoothstep(0.35, 2.2, motion_length);
  vSide = position.y;
  vTint = aTint;
  gl_Position = vec4(clip, 0.0, 1.0);
}
