precision highp float;

attribute vec3 aDirection;
attribute float aMagnitude;
uniform vec2 uResolution;
uniform float uAspect;
uniform float uMapScale;
uniform float uTrailMapScale;
uniform float uHalfWidth;
uniform float uTrailMaxLength;
uniform float uTrailOpacity;
uniform vec3 uRight;
uniform vec3 uUp;
uniform vec3 uForward;
uniform vec3 uTrailRight;
uniform vec3 uTrailUp;
uniform vec3 uTrailForward;
varying float vAlong;
varying float vBrightness;
varying float vMotion;
varying float vSide;
varying float vVisible;

vec2 projectWithBasis(
  vec3 point,
  vec3 right,
  vec3 up,
  vec3 forward,
  float scale,
  out float depth
) {
  vec3 direction = normalize(point);
  vec3 local = vec3(
    dot(direction, right),
    dot(direction, up),
    dot(direction, forward)
  );
  float denominator = max(0.08, 1.0 + local.z);
  vec2 stereographic = 2.0 * local.xy / denominator;
  depth = clamp((local.z + 1.0) * 0.5, 0.0, 1.0);
  return stereographic * vec2(-scale / uAspect, -scale) + 0.5;
}

float insideViewport(vec2 point) {
  const float margin = 0.04;
  return step(-margin, point.x) *
    step(-margin, point.y) *
    step(point.x, 1.0 + margin) *
    step(point.y, 1.0 + margin);
}

void main() {
  float currentDepth;
  vec2 currentPoint = projectWithBasis(
    aDirection,
    uRight,
    uUp,
    uForward,
    uMapScale,
    currentDepth
  );
  float previousDepth;
  vec2 previousPoint = projectWithBasis(
    aDirection,
    uTrailRight,
    uTrailUp,
    uTrailForward,
    uTrailMapScale,
    previousDepth
  );
  vec2 motionPixels = (currentPoint - previousPoint) * uResolution;
  float motionLength = length(motionPixels);
  vec2 direction = motionPixels / max(motionLength, 0.0001);
  float cappedLength = min(motionLength, uTrailMaxLength);
  vec2 startPoint = currentPoint - direction * cappedLength / uResolution;
  vec2 point = mix(startPoint, currentPoint, position.x);
  vec2 normal = vec2(-direction.y, direction.x);
  vec2 clip = vec2(point.x * 2.0 - 1.0, 1.0 - point.y * 2.0);
  float brightnessBase = clamp((6.25 - aMagnitude) / 7.75, 0.015, 1.0);
  vBrightness = pow(brightnessBase, 1.28);
  float halfWidth =
    uHalfWidth *
    mix(0.5, 1.02, pow(vBrightness, 0.68)) *
    mix(0.82, 1.0, currentDepth) *
    mix(0.18, 1.0, position.x);
  vec2 normalClip =
    vec2(normal.x, -normal.y) * (2.0 * halfWidth / uResolution);

  clip += normalClip * position.y;
  vAlong = position.x;
  vMotion = smoothstep(0.75, 3.2, motionLength);
  vSide = position.y;
  vVisible =
    step(0.16, currentDepth) *
    step(0.16, previousDepth) *
    insideViewport(currentPoint) *
    step(0.001, uTrailOpacity);
  gl_Position = vec4(clip, 0.0, 1.0);
}
