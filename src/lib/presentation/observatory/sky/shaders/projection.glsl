uniform float uOrbitAngle;
uniform float uAspect;

vec2 orbitFieldPoint(vec2 point, float angle) {
  const vec2 celestial_pole = vec2(0.62, 0.64);
  vec2 offset = point - celestial_pole;
  offset.x *= uAspect;
  float cosine = cos(angle);
  float sine = sin(angle);
  offset = mat2(cosine, -sine, sine, cosine) * offset;
  offset.x /= uAspect;
  return celestial_pole + offset;
}

vec2 warpFieldPoint(vec2 point, float depth) {
  const vec2 field_center = vec2(0.55, 0.5);
  vec2 offset = point - field_center;
  float radial_weight = smoothstep(0.08, 0.82, length(offset));
  float depth_weight = smoothstep(0.16, 0.92, depth);
  float stretch = 1.0 + radial_weight * depth_weight * 0.075;

  offset *= stretch;
  offset.y += offset.x * depth_weight * 0.035;
  return field_center + offset;
}
