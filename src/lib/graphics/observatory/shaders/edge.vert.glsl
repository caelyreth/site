precision highp float;

attribute vec3 aStart;
attribute vec3 aEnd;
attribute float aDistanceStart;
attribute float aDistanceEnd;
attribute float aWeight;
uniform vec2 uResolution;
uniform float uAspect;
uniform float uMapScale;
uniform float uHalfWidth;
uniform vec3 uRight;
uniform vec3 uUp;
uniform vec3 uForward;
varying float vSide;
varying float vSignalDistance;
varying float vWeight;
varying float vDepth;

/* @include projection */

vec3 arcPoint(float along) {
  return normalize(mix(aStart, aEnd, along));
}

void main() {
  float along = position.x;
  float depth;
  vec2 point = projectSky(arcPoint(along), depth);
  float tangentStep = 0.022;
  float unusedDepth;
  vec2 before = projectSky(arcPoint(max(0.0, along - tangentStep)), unusedDepth);
  vec2 after = projectSky(arcPoint(min(1.0, along + tangentStep)), unusedDepth);
  vec2 direction = normalize((after - before) * uResolution);
  vec2 normal = vec2(-direction.y, direction.x);
  vec2 clip = vec2(point.x * 2.0 - 1.0, 1.0 - point.y * 2.0);
  float depthWidth = mix(0.78, 1.0, depth);
  vec2 normalClip =
    vec2(normal.x, -normal.y) *
    (2.0 * uHalfWidth * depthWidth / uResolution);

  clip += normalClip * position.y;
  vSide = position.y;
  vSignalDistance = mix(aDistanceStart, aDistanceEnd, along);
  vWeight = aWeight;
  vDepth = depth;
  gl_Position = vec4(clip, 0.0, 1.0);
}
