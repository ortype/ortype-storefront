import { LinkIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

export default defineType({
  name: 'body',
  title: 'Body',
  type: 'array',
  of: [
    defineArrayMember({
      lists: [
        { title: 'Bullet', value: 'bullet' },
        { title: 'Numbered', value: 'number' },
      ],
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
          defineField({
            name: 'internalLink',
            type: 'object',
            title: 'Internal link',
            icon: () => <LinkIcon />,
            fields: [
              {
                name: 'reference',
                type: 'reference',
                title: 'Reference',
                to: [
                  { type: 'post' },
                  // other types you may want to link to
                ],
              },
            ],
          }),
        ],
        decorators: [
          {
            title: 'Italic',
            value: 'em',
          },
          // {
          //   title: 'Strong',
          //   value: 'strong'
          // }
        ],
      },
      // Inline blocks (potentially interesting usecase...)
      // of: [{ type: '' }]
      styles: [
        { title: 'Heading', value: 'h2' },
        // { title: 'Quote', value: 'blockquote' },
      ],
      // Paragraphs
      type: 'block',
    }),
    // Custom blocks
    /*
    {
      type: 'module.image'
    },
    */
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          description: 'Important for SEO and accessiblity.',
          validation: (rule) => {
            return rule.custom((alt, context) => {
              if ((context.document?.coverImage as any)?.asset?._ref && !alt) {
                return 'Required'
              }
              return true
            })
          },
        },
        defineField({
          name: 'caption',
          type: 'text',
        }),
        defineField({
          name: 'config',
          title: 'Config',
          type: 'object',
          fields: [
            defineField({
              type: 'string',
              name: 'display',
              title: 'Constrain image',
              initialValue: 'verso',
              options: {
                layout: 'radio',
                direction: 'horizontal',
                list: [
                  { title: 'Vertical', value: 'vertical' },
                  { title: 'Horizontal', value: 'horizontal' },
                ],
              },
            }),
            defineField({
              type: 'boolean',
              name: 'thumbnail',
              title: 'Thumbnail size image',
              initialValue: false,
            }),
          ],
        }),
      ],
      validation: (rule) => rule.required(),
    }),
  ],
})
