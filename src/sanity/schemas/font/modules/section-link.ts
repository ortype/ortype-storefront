import { LinkIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'module.sectionLink',
  title: 'Section link',
  type: 'object',
  icon: LinkIcon,
  description:
    'Place immediately before a content module to add a link to the font navigation. This does not add a page or start a new spread.',
  fields: [
    defineField({
      name: 'label',
      title: 'Button label',
      type: 'string',
      description: 'Keep this short, for example “Specimens” or “Styles”.',
      validation: (rule) => [
        rule
          .required()
          .custom((label) =>
            label?.trim() ? true : 'Enter a button label.'
          ),
        rule.max(30).warning('Short labels work best in the navigation.'),
      ],
    }),
  ],
  validation: (rule) =>
    rule
      .custom((value, context) => {
        const modules = context.document?.modules
        if (!Array.isArray(modules)) return true
        const index = modules.findIndex((item) => item._key === value?._key)
        if (index === -1) return true
        const next = modules[index + 1]
        return next &&
          next._type !== 'sectionLink' &&
          next._type !== 'module.sectionLink'
          ? true
          : 'Place this link immediately before a content module, not another section link or the end of the list.'
      })
      .warning(),
  preview: {
    select: { label: 'label' },
    prepare: ({ label }) => ({
      title: label?.trim() || 'Section link',
      subtitle: 'Navigation marker · no extra page',
    }),
  },
})
