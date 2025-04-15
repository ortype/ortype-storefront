import body from '@/sanity/schemas/font/blocks/body'
import { toPlainText } from '@portabletext/toolkit'
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'module.content',
  title: 'Content',
  type: 'object',
  fields: [
    defineField({ name: 'title', type: 'string' }),
    defineField({ name: 'body', type: body.name }),
    defineField({
      name: 'centered',
      title: 'Center text',
      type: 'boolean',
    }),
    defineField({
      name: 'overflowCol',
      title: 'Overflow into columns',
      description:
        'Content overflow is handled by a overlay, unless this is ticked, then it flows content across a spread',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      moduleTitle: 'title',
      body: 'body', // PortableTextBlock[]
    },
    prepare(selection) {
      const { body, moduleTitle } = selection
      return {
        title: moduleTitle || 'Content',
        subtitle: body && toPlainText(body),
      }
    },
  },
})
