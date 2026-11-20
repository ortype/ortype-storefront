// React-free configuration shared by Studio inputs and the frontend tester.
export const testerPresets = [
  { value: 'headline', label: 'Headline', zoom: 0.7 },
  { value: 'short', label: 'Short text', zoom: 0.28 },
  { value: 'medium', label: 'Medium text', zoom: 0.12 },
  { value: 'long', label: 'Long text', zoom: 0 },
] as const

export function getAvailableTesterPresets(enableLongText: boolean) {
  return testerPresets.filter(
    (preset) => preset.value !== 'long' || enableLongText
  )
}

export function getMinimumTesterZoom(enableLongText: boolean) {
  return Math.min(
    ...getAvailableTesterPresets(enableLongText).map((preset) => preset.zoom)
  )
}

export function resolveInitialTesterPreset(
  value: string | null | undefined,
  enableLongText: boolean
) {
  return (
    getAvailableTesterPresets(enableLongText).find(
      (preset) => preset.value === value
    ) ?? testerPresets[0]
  )
}
