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

vec2 projectSky(vec3 point, out float depth) {
  vec3 local = vec3(
    dot(point, uRight),
    dot(point, uUp),
    dot(point, uForward)
  );
  float denominator = max(0.08, 1.0 + local.z);
  vec2 stereographic = 2.0 * local.xy / denominator;
  depth = clamp((local.z + 1.0) * 0.5, 0.0, 1.0);
  // Keep north up and right ascension increasing toward the left.
  vec2 projected = stereographic * vec2(-uMapScale / uAspect, -uMapScale) + 0.5;
  return warpFieldPoint(projected, depth);
}
