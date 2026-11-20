'use client'

import { useReducer } from 'react'
import type { Font } from '@/types'
import type { TesterModuleValue } from '@/components/pages/fonts/font-sections'
import { resolveInitialTesterPreset } from '@/lib/tester-presets'
import { clampTesterZoom } from './tester-layout'

type TesterState = {
  variantId: string
  zoom: number
  revision: number
}

type TesterAction =
  | { type: 'variant'; value: string }
  | { type: 'zoom'; value: number }
  | { type: 'reset'; variantId: string; zoom: number }

function reducer(state: TesterState, action: TesterAction): TesterState {
  switch (action.type) {
    case 'variant':
      return { ...state, variantId: action.value }
    case 'zoom':
      return { ...state, zoom: action.value }
    case 'reset':
      return {
        variantId: action.variantId,
        zoom: action.zoom,
        revision: state.revision + 1,
      }
  }
}

export function useTesterState(value: TesterModuleValue, font: Font) {
  const variants = [
    ...font.variants,
    ...font.styleGroups.flatMap((group) => [
      ...group.variants,
      ...group.italicVariants,
    ]),
  ].filter((variant) => variant?._id)
  const reference = value.defaultVariant
  const moduleVariantId = reference?._ref
  const defaultVariantId =
    [moduleVariantId, font.defaultVariant?._id].find((id) =>
      variants.some((variant) => variant._id === id)
    ) ??
    variants[0]?._id ??
    ''
  const enableLongText = value.enableLongText === true
  const initialPreset = resolveInitialTesterPreset(
    value.initialPreset,
    enableLongText
  )
  const [state, dispatch] = useReducer(reducer, {
    variantId: defaultVariantId,
    zoom: initialPreset.zoom,
    revision: 0,
  })
  const variantId = variants.some(
    (variant) => variant._id === state.variantId
  )
    ? state.variantId
    : defaultVariantId

  return {
    variantId,
    zoom: clampTesterZoom(state.zoom, enableLongText),
    revision: state.revision,
    enableLongText,
    initialText: value.defaultText ?? 'Type is a space you can move through.',
    setVariant: (id: string) => dispatch({ type: 'variant', value: id }),
    setZoom: (zoom: number) =>
      dispatch({
        type: 'zoom',
        value: clampTesterZoom(zoom, enableLongText),
      }),
    reset: () =>
      dispatch({
        type: 'reset',
        variantId: defaultVariantId,
        zoom: initialPreset.zoom,
      }),
  }
}
