import { BookIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

export default {
  name: 'module.info',
  title: 'Info',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
    }),
    defineField({
      type: 'array',
      name: 'items',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'item',
          fields: [
            defineField({
              type: 'string',
              name: 'key',
            }),
            defineField({
              name: 'content',
              title: 'Content',
              type: 'array',
              of: [
                defineArrayMember({
                  lists: [],
                  marks: {
                    annotations: [
                      defineField({
                        type: 'object',
                        name: 'link',
                        fields: [
                          {
                            type: 'string',
                            name: 'href',
                            title: 'URL',
                            validation: (rule) => rule.required(),
                          },
                        ],
                      }),
                    ],
                    decorators: [
                      {
                        title: 'Italic',
                        value: 'em',
                      },
                    ],
                  },
                  styles: [],
                  type: 'block',
                }),
              ],
            }),
          ],
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
        // subtitle: `Display as '${config.display}'`,
        title: moduleTitle || '',
      }
    },
  },
}
