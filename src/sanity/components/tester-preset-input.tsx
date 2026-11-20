'use client'

import { getAvailableTesterPresets } from '@/lib/tester-presets'
import { useFormValue, type StringInputProps } from 'sanity'

export default function TesterPresetInput(props: StringInputProps) {
  const enableLongText =
    useFormValue([...props.path.slice(0, -1), 'enableLongText']) === true

  // Keep Sanity's native input, patches, focus, and collaborative editing.
  // Only the displayed list depends on the sibling field in this module.
  return props.renderDefault({
    ...props,
    schemaType: {
      ...props.schemaType,
      options: {
        ...props.schemaType.options,
        list: getAvailableTesterPresets(enableLongText).map((preset) => ({
          title: preset.label,
          value: preset.value,
        })),
      },
    },
  })
}
