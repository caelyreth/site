export function choose_pixel_ratio(width: number, height: number) {
  const native_ratio = Math.min(window.devicePixelRatio || 1, 2)
  const pixel_budget = 7_600_000
  const budget_ratio = Math.sqrt(pixel_budget / Math.max(1, width * height))
  return Math.max(1, Math.min(native_ratio, budget_ratio))
}
