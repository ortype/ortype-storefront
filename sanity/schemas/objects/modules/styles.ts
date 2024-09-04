import { BookIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

export default {
  name: 'module.styles',
  title: 'Styles',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      initialValue: 'Styles',
    }),
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
        title: moduleTitle || 'Styles',
      }
    },
  },
}
