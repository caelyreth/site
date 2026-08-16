uniform float uOrbitAngle;

vec2 orbitFieldPoint(vec2 point, float angle) {
  const vec2 horizon = vec2(1.12, -0.14);
  vec2 offset = point - horizon;
  float cosine = cos(angle);
  float sine = sin(angle);
  return horizon + mat2(cosine, -sine, sine, cosine) * offset;
}

vec2 warpFieldPoint(vec2 point, float depth) {
  const vec2 vanishing_point = vec2(0.82, 0.58);
  vec2 offset = point - vanishing_point;
  float radial_weight = smoothstep(0.08, 0.82, length(offset));
  float depth_weight = smoothstep(0.16, 0.92, depth);
  float stretch = 1.0 + radial_weight * depth_weight * 0.075;

  offset *= stretch;
  offset.y += offset.x * depth_weight * 0.035;
  return vanishing_point + offset;
}
