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
    defineField({
      name: 'config',
      title: 'Config',
      type: 'object',
      fields: [
        defineField({
          name: 'italicToggle',
          title: 'Italic toggle active',
          type: 'boolean',
          initialValue: false,
        }),
      ],
    }),
  ],
  preview: {
    select: {
      moduleTitle: 'title',
      config: 'config',
    },
    prepare(selection) {
      const { moduleTitle, config } = selection
      return {
        // media: <BookIcon />,
        subtitle: `Italic toggle enabled: '${config.italicToggle}'`,
        title: moduleTitle || 'Styles',
      }
    },
  },
}
