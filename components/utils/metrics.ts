import { Metafield, Metrics } from '@/lib/sanity.queries'

export default function getMetrics(metafields?: Metafield[]): Metrics {
  let metrics: Metrics = {
    unitsPerEm: 0,
    contentArea: 0,
    lineGap: 0,
    capHeight: 0,
    ascent: 0,
    descent: 0,
    distanceTop: 0,
  }
  if (metafields) {
    const getMetric = (key: string): number => {
      return Number(metafields.find((field) => field.key === key)?.value)
    }
    const unitsPerEm = getMetric('unitsPerEm')
    const capHeight = getMetric('capHeight') / unitsPerEm
    const lineGap = getMetric('hheaLineGap') / unitsPerEm
    const ascent = getMetric('usWinAscent') / unitsPerEm
    const descent = getMetric('usWinDescent') / unitsPerEm
    const contentArea = ascent + descent
    const distanceTop = ascent - capHeight

    metrics = {
      unitsPerEm,
      contentArea,
      lineGap,
      capHeight,
      ascent,
      descent,
      distanceTop,
    }
  }
  return metrics
}
