export const VFD_REFRESH_INTERVAL = 6_400
export const VFD_REFRESH_STEP_DURATION = 180

export const VFD_REFRESH_READOUTS = [
  'RX//ORBIT',
  'STAR*DRFT',
  'VOID*LINK',
  'SCAN+004',
] as const

export function vfd_refresh_frame(step: number, slots: number) {
  const position = Math.min(step, slots - 1)
  const previous = step > 0 && step < slots ? position - 1 : -1
  return Array.from({ length: slots }, (_, index) =>
    index === position || index === previous ? '*' : ' ',
  ).join('')
}
