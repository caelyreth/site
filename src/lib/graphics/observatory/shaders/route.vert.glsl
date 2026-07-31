precision highp float;

uniform vec2 uResolution;
uniform float uAspect;
uniform float uMapScale;
uniform float uHalfWidth;
uniform float uRouteLength;
uniform vec3 uRouteStart;
uniform vec3 uRouteEnd;
uniform vec3 uRouteBend;
uniform vec3 uRight;
uniform vec3 uUp;
uniform vec3 uForward;
varying float vSide;
varying float vDistance;
varying float vDepth;

/* @include projection */

vec3 routePoint(float along) {
  float angle = acos(clamp(dot(uRouteStart, uRouteEnd), -1.0, 1.0));
  float sine = sin(angle);
  vec3 greatCircle = sine < 0.001
    ? mix(uRouteStart, uRouteEnd, along)
    : (
    uRouteStart * sin((1.0 - along) * angle) / sine +
    uRouteEnd * sin(along * angle) / sine
  );
  return normalize(greatCircle + uRouteBend * sin(3.14159265359 * along) * 0.38);
}

void main() {
  float along = position.x;
  float depth;
  vec2 point = projectSky(routePoint(along), depth);
  const float tangentStep = 0.012;
  float unusedDepth;
  vec2 before = projectSky(
    routePoint(max(0.0, along - tangentStep)),
    unusedDepth
  );
  vec2 after = projectSky(
    routePoint(min(1.0, along + tangentStep)),
    unusedDepth
  );
  vec2 tangent = (after - before) * uResolution;
  vec2 direction = tangent / max(length(tangent), 0.0001);
  vec2 normal = vec2(-direction.y, direction.x);
  vec2 clip = vec2(point.x * 2.0 - 1.0, 1.0 - point.y * 2.0);
  vec2 normalClip =
    vec2(normal.x, -normal.y) *
    (2.15 * uHalfWidth * mix(0.76, 1.0, depth) / uResolution);

  clip += normalClip * position.y;
  vSide = position.y;
  vDistance = along * uRouteLength;
  vDepth = depth;
  gl_Position = vec4(clip, 0.0, 1.0);
}
