import { BookIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

export default {
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
      type: 'string',
    }),
    {
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
            parentUid: document.uid,
          },
        }),
      },
      preview: {
        title: 'name',
      },
    },
  ],
  preview: {
    select: {
      moduleTitle: 'title',
    },
    prepare(selection) {
      const { moduleTitle, config } = selection
      return {
        // media: <BookIcon />,
        // subtitle: `Display as '${config.display}'`,
        title: moduleTitle || 'Type Tester',
      }
    },
  },
}
