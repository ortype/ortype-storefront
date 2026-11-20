import BookReferenceInput from '@/sanity/components/book-reference-input'
import BookModulePreview from '@/sanity/components/book-module-preview'
import BookSnapshotInput from '@/sanity/components/book-snapshot-input'
import { defineField } from 'sanity'

export default {
  name: 'module.book',
  title: 'Book',
  type: 'object',
  components: { preview: BookModulePreview },
  fields: [
    {
      name: 'book',
      title: 'Book Layout',
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
      title: 'Snapshot config',
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
      title: 'book.name',
      bookId: 'book._id',
      fontId: 'book.fontId',
      variantId: 'book.variantId',
      config: 'config',
    },
  },
}
