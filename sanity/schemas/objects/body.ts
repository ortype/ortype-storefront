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
        annotations: [],
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
        { title: 'Quote', value: 'blockquote' },
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
      ],
      validation: (rule) => rule.required(),
    }),
  ],
})
