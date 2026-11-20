import { BookIcon } from '@sanity/icons'
import BookReferenceInput from '@/sanity/components/book-reference-input'
import BookSnapshotInput from '@/sanity/components/book-snapshot-input'
import { defineField } from 'sanity'

export default {
  name: 'module.book',
  title: 'Book',
  type: 'object',
  fields: [
    {
      name: 'book',
      title: 'Book',
      type: 'reference',
      weak: true,
      to: [{ type: 'book' }],
      components: { input: BookReferenceInput },
      validation: (Rule) => Rule.required(),
      options: {
        disableNew: true,
        filter: ({ document }) => ({
          filter: 'fontId == $fontId',
          params: {
            fontId: document._id.replace('drafts.', ''),
          },
        }),
      },
      preview: {
        title: 'name',
      },
    },
    defineField({
      name: 'config',
      title: 'Config',
      type: 'object',
      components: { input: BookSnapshotInput },
      fields: [
        defineField({
          name: 'snapshotKey',
          title: 'Snapshot',
          type: 'string',
          // The visual picker owns this stable identity; an array index would
          // silently select different content when snapshots are reordered.
          hidden: true,
        }),
        defineField({
          type: 'string',
          name: 'display',
          title: 'Display options',
          initialValue: 'verso',
          options: {
            layout: 'radio',
            direction: 'horizontal',
            list: [
              { title: 'Verso', value: 'verso' },
              { title: 'Recto', value: 'recto' },
            ],
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      moduleTitle: 'book.name',
      config: 'config',
    },
    prepare(selection) {
      const { moduleTitle, config } = selection
      return {
        media: <BookIcon />,
        subtitle: config?.display
          ? `Display as '${config?.display}'${config.snapshotKey ? ' · Selected snapshot' : ''}`
          : 'Choose recto or verso',
        title: `Book: '${moduleTitle}'`,
      }
    },
  },
}
