precision highp float;

attribute float aMagnitude;
attribute float aDistance;
uniform float uAspect;
uniform float uMapScale;
uniform float uPixelRatio;
uniform float uPulseDistance;
uniform float uPulseActive;
uniform float uHeadWidth;
uniform float uSourceRadius;
uniform vec3 uRight;
uniform vec3 uUp;
uniform vec3 uForward;
varying float vActivation;
varying float vBrightness;
varying float vDepth;

/* @include projection */

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
  vActivation = max(head, source) * uPulseActive;
  vDepth = depth;
  gl_Position = vec4(point.x * 2.0 - 1.0, 1.0 - point.y * 2.0, 0.0, 1.0);
  gl_PointSize =
    (0.82 + vBrightness * 3.4 + vActivation * 2.15) *
    uPixelRatio *
    mix(0.82, 1.0, depth);
}
