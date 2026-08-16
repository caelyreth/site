export interface SkyMapEngine {
  destroy: () => void
  set_active: (active: boolean) => void
  set_theme: (dark: boolean) => void
}
