precision highp float;

uniform float uGroundHorizon;
uniform float uGroundAlpha;
uniform vec3 uGroundInk;
uniform vec3 uGroundLight;
varying vec2 vUv;

void main() {
  float depth = max(0.0, vUv.y - uGroundHorizon);
  float plane = smoothstep(0.004, 0.032, depth);
  float normalized_depth = depth / max(1.0 - uGroundHorizon, 0.001);
  float horizon_light =
    plane *
    (1.0 - smoothstep(0.0, 0.14, normalized_depth));
  float floor_light = plane * pow(1.0 - normalized_depth, 1.7);
  float alpha = (horizon_light * 0.16 + floor_light * 0.09) * uGroundAlpha;
  vec3 ink = mix(uGroundInk, uGroundLight, horizon_light * 0.48);

  if (alpha < 0.002) discard;
  gl_FragColor = vec4(ink, alpha);
  #include <colorspace_fragment>
}
