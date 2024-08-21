import { BookIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

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
    // @TODO: is it possible to select from bookRef.snapshots here?
    defineField({
      name: 'config',
      title: 'Config',
      type: 'object',
      fields: [
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
        subtitle: `Display as '${config.display}'`,
        title: `Layout: '${moduleTitle}'`,
      }
    },
  },
}
