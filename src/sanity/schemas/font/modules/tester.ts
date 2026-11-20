import { defineField, defineType } from 'sanity'

import {
  getAvailableTesterPresets,
  testerPresets,
} from '@/lib/tester-presets'
import TesterPresetInput from '@/sanity/components/tester-preset-input'

export default defineType({
  name: 'module.tester',
  title: 'Tester',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      initialValue: 'Type Tester',
    }),
    defineField({
      name: 'defaultText',
      title: 'Default text',
      type: 'text',
      rows: 8,
      description:
        'Initial editable specimen text. Line breaks are preserved.',
    }),
    defineField({
      name: 'initialPreset',
      title: 'Initial preset',
      type: 'string',
      initialValue: testerPresets[0].value,
      components: { input: TesterPresetInput },
      options: {
        list: testerPresets.map((preset) => ({
          title: preset.label,
          value: preset.value,
        })),
      },
      validation: (rule) =>
        rule.custom((value, context) => {
          if (!value) return true
          const parent = context.parent
          const enableLongText =
            !!parent &&
            typeof parent === 'object' &&
            'enableLongText' in parent &&
            parent.enableLongText === true
          return (
            getAvailableTesterPresets(enableLongText).some(
              (preset) => preset.value === value
            ) ||
            'Choose an available preset, or enable long text to use Long text.'
          )
        }),
      description: 'Choose which preset is initially selected',
    }),
    defineField({
      name: 'enableLongText',
      title: 'Enable long text',
      type: 'boolean',
      initialValue: false,
      description: 'Allow the long-text preset and smallest text sizes.',
    }),
    defineField({
      name: 'defaultVariant',
      title: 'Default variant',
      type: 'reference',
      weak: true,
      to: [{ type: 'fontVariant' }],
      options: {
        disableNew: true,
        filter: ({ document }) => ({
          filter: 'parentUid == $parentUid',
          params: {
            // fontId: document._id.replace('drafts.', ''),
            parentUid: document?.uid,
          },
        }),
      },
    }),
  ],
  preview: {
    select: {
      moduleTitle: 'title',
    },
    prepare({ moduleTitle }) {
      return {
        title: moduleTitle || 'Type Tester',
      }
    },
  },
})
