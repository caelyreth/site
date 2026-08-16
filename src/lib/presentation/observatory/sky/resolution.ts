const MAX_PIXEL_RATIO = 1.5
const PIXEL_BUDGET = 3_600_000

export function choose_pixel_ratio(width: number, height: number) {
  const native_ratio = Math.min(
    window.devicePixelRatio || 1,
    MAX_PIXEL_RATIO,
  )
  const budget_ratio = Math.sqrt(PIXEL_BUDGET / Math.max(1, width * height))
  return Math.max(1, Math.min(native_ratio, budget_ratio))
}
