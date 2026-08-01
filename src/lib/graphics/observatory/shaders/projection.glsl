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
  return stereographic * vec2(-uMapScale / uAspect, -uMapScale) + 0.5;
}
