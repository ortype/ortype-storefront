import { defineField, defineType } from 'sanity'

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
      name: 'enableLongParagraph',
      title: 'Enable long paragraph',
      type: 'boolean',
      initialValue: false,
      description: 'Allow the long-paragraph preset and smallest text sizes.',
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
