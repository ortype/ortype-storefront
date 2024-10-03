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
