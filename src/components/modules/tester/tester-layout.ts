import { getMinimumTesterZoom } from '@/lib/tester-presets'

const shortZoom = 0.1

export function clampTesterZoom(zoom: number, enableLongText: boolean) {
  return Math.max(getMinimumTesterZoom(enableLongText), Math.min(1, zoom))
}
export function getTesterLayout(width: number, zoom: number) {
  const detail = 1 - zoom
  const eased = detail * detail * (3 - 2 * detail)
  const viewportScale = Math.min(1.4, Math.max(0.55, width / 1360))
  const gap = Math.min(48, Math.max(24, width * 0.03))
  const requestedColumns = zoom >= 0.2 ? 1 : zoom >= shortZoom ? 2 : 3
  const availableColumns = Math.max(
    1,
    Math.floor((width + gap) / (260 + gap))
  )

  const maxFontSize = 225
  const minFontSize = 16

  return {
    fontSize: Math.max(
      16,
      (maxFontSize - eased * (maxFontSize - minFontSize)) * viewportScale
    ),
    letterSpacing: 0,
    lineHeight: 0.96 + eased * 0.35,
    columns: Math.min(requestedColumns, availableColumns),
    gap,
  }
}
