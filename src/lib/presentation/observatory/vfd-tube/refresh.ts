export const VFD_REFRESH_INTERVAL = 6_400
export const VFD_REFRESH_STEP_DURATION = 180

export function refresh_frame(step: number, slots: number) {
  const position = Math.min(step, slots - 1)
  const previous = step > 0 && step < slots ? position - 1 : -1
  return Array.from({ length: slots }, (_, index) =>
    index === position || index === previous ? '*' : ' ',
  ).join('')
}
