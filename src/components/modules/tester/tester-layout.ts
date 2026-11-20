export const testerPresets = [
  { value: 'headline', label: 'Headline', zoom: 0.8 },
  { value: 'short', label: 'Short paragraph', zoom: 0.32 },
  { value: 'long', label: 'Long paragraph', zoom: 0 },
] as const

export function clampTesterZoom(zoom: number, enableLongParagraph: boolean) {
  return Math.max(enableLongParagraph ? 0 : 0.32, Math.min(1, zoom))
}

const activePreset = (
  zoom: number
): (typeof testerPresets)[number]['value'] => {
  if (zoom >= testerPresets[0].zoom) return 'headline'
  if (zoom >= testerPresets[1].zoom) return 'short'
  return 'long'
}

export function getTesterLayout(width: number, zoom: number) {
  const detail = 1 - zoom
  const eased = detail * detail * (3 - 2 * detail)
  const viewportScale = Math.min(1.4, Math.max(0.55, width / 1360))
  const gap = Math.min(48, Math.max(24, width * 0.03))
  const requestedColumns = zoom >= 0.35 ? 1 : zoom >= 0.12 ? 2 : 3
  const availableColumns = Math.max(
    1,
    Math.floor((width + gap) / (260 + gap))
  )

  const maxFontSize = 300
  const minFontSize = 18

  const preset = activePreset(zoom)
  const letterSpacing = preset === 'headline' ? -0.035 + eased * 0.022 : 0
  const lineHeight = preset === 'headline' ? 1 : 0.96 + eased * 0.35

  return {
    fontSize: Math.max(
      16,
      (maxFontSize - eased * (maxFontSize - minFontSize)) * viewportScale
    ),
    letterSpacing,
    lineHeight,
    columns: Math.min(requestedColumns, availableColumns),
    gap,
  }
}
