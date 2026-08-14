precision highp float;

uniform sampler2D uBackdrop;
uniform vec3 uBackgroundInk;
uniform float uBackgroundAlpha;
uniform vec3 uBackgroundWashInk;
uniform float uBackgroundWashAlpha;
uniform vec3 uExposureInk;
uniform float uExposureAlpha;
uniform float uAspect;
uniform float uMapScale;
uniform vec3 uRight;
uniform vec3 uUp;
uniform vec3 uForward;
varying vec2 vUv;

void main() {
  vec2 stereographic = vec2(
    -(vUv.x - 0.5) * uAspect / uMapScale,
    (vUv.y - 0.5) / uMapScale
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
  float detailAlpha = (nearby * 0.24 + distant * 0.11) * uBackgroundAlpha;
  float fieldAxis = vUv.y + (vUv.x - 0.5) * 0.16;
  float exposure = 1.0 - smoothstep(0.04, 0.18, abs(fieldAxis - 0.98));
  float exposureGrain = mix(0.68, 1.0, nearby * 0.72 + distant * 0.28);
  float exposureAlpha = exposure * exposureGrain * uExposureAlpha;
  float washAlpha = max(uBackgroundWashAlpha, exposureAlpha);
  float alpha = max(detailAlpha, washAlpha);
  vec3 washInk = mix(
    uBackgroundWashInk,
    uExposureInk,
    exposureAlpha / max(washAlpha, 0.001)
  );
  vec3 ink = mix(washInk, uBackgroundInk, detailAlpha / max(alpha, 0.001));

  if (alpha < 0.002) discard;
  gl_FragColor = vec4(ink, alpha);
  #include <colorspace_fragment>
}
