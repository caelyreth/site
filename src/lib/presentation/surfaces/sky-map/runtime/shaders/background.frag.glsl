precision highp float;

uniform sampler2D uBackdrop;
uniform vec3 uBackgroundInk;
uniform float uBackgroundAlpha;
uniform vec3 uBackgroundWashInk;
uniform float uBackgroundWashAlpha;
uniform float uAspect;
uniform float uMapScale;
uniform vec3 uRight;
uniform vec3 uUp;
uniform vec3 uForward;
varying vec2 vUv;

vec2 warpFieldUv(vec2 point) {
  const vec2 vanishing_point = vec2(0.82, 0.58);
  vec2 offset = point - vanishing_point;
  float radial_weight = smoothstep(0.08, 0.82, length(offset));
  float stretch = 1.0 + radial_weight * 0.075;

  offset *= stretch;
  offset.y += offset.x * 0.035;
  return vanishing_point + offset;
}

void main() {
  vec2 field_uv = warpFieldUv(vUv);
  vec2 stereographic = vec2(
    -(field_uv.x - 0.5) * uAspect / uMapScale,
    (field_uv.y - 0.5) / uMapScale
  );
  float squaredRadius = dot(stereographic, stereographic);
  float denominator = 4.0 + squaredRadius;
  vec3 local = vec3(
    4.0 * stereographic / denominator,
    (4.0 - squaredRadius) / denominator
  );
  vec3 direction = local.x * uRight + local.y * uUp + local.z * uForward;
  float longitude = atan(direction.z, direction.x);
  float latitude = asin(clamp(direction.y, -1.0, 1.0));
  vec2 skyUv = vec2(
    fract(longitude / 6.28318530718 + 0.5),
    0.5 - latitude / 3.14159265359
  );
  float nearby = texture2D(uBackdrop, fract(skyUv * vec2(11.0, 13.0))).r;
  float distant = texture2D(uBackdrop, fract(skyUv * vec2(7.33, 8.67))).r;
  float current = 0.68 - field_uv.x * 0.18 + field_uv.y * 0.16;
  float current_band = exp(-pow((field_uv.y - current) / 0.11, 2.0));
  float current_texture = texture2D(
    uBackdrop,
    fract(skyUv * vec2(17.3, 9.1))
  ).r;
  float detailAlpha = (
    nearby * 0.24 +
    distant * 0.11 +
    current_texture * current_band * 0.045
  ) * uBackgroundAlpha;
  float washAlpha = uBackgroundWashAlpha;
  float alpha = max(detailAlpha, washAlpha);
  vec3 ink = mix(
    uBackgroundWashInk,
    uBackgroundInk,
    detailAlpha / max(alpha, 0.001)
  );

  if (alpha < 0.002) discard;
  gl_FragColor = vec4(ink, alpha);
  #include <colorspace_fragment>
}
